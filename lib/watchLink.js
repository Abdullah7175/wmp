import crypto from 'crypto';
import { createReadStream } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { query } from './db.js';

const PLAYABLE_EXT = new Set(['.mp4', '.m4v', '.webm', '.mov']);
const CONTENT_TYPES = {
    '.mp4': 'video/mp4',
    '.m4v': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
};

const PLAYBACK_MAX_AGE_SEC = 60 * 60 * 2;
const FILE_CACHE_MS = 30 * 1000;
const MISS_CACHE_MS = 10 * 1000;

const fileCache = new Map();
const hits = new Map();

function getKey() {
    const secret = process.env.WATCH_LINK_SECRET || process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
    if (!secret || String(secret).length < 16) {
        throw new Error('Watch link secret is not configured');
    }
    return crypto.createHash('sha256').update(`wmp-watch-link:v1:${secret}`).digest();
}

function timingEqual(a, b) {
    const left = Buffer.from(String(a));
    const right = Buffer.from(String(b));
    if (left.length !== right.length) return false;
    return crypto.timingSafeEqual(left, right);
}

export function createWatchToken(requestId) {
    const id = Number(requestId);
    if (!Number.isInteger(id) || id <= 0 || id > 2147483647) {
        throw new Error('Invalid request');
    }
    const key = getKey();
    const iv = crypto.createHmac('sha256', key).update(`iv:${id}`).digest().subarray(0, 12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(`v1:${id}`, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString('base64url');
}

export function readWatchToken(token) {
    if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{20,200}$/.test(token)) return null;
    try {
        const buf = Buffer.from(token, 'base64url');
        if (buf.length < 12 + 16 + 4) return null;
        const iv = buf.subarray(0, 12);
        const tag = buf.subarray(12, 28);
        const encrypted = buf.subarray(28);
        const key = getKey();
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(tag);
        const plain = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
        const match = /^v1:(\d+)$/.exec(plain);
        if (!match) return null;
        const id = Number(match[1]);
        if (!Number.isInteger(id) || id <= 0 || id > 2147483647) return null;
        const expectedIv = crypto.createHmac('sha256', key).update(`iv:${id}`).digest().subarray(0, 12);
        if (!crypto.timingSafeEqual(iv, expectedIv)) return null;
        return id;
    } catch {
        return null;
    }
}

export function createPlaybackGrant(token) {
    const exp = Date.now() + PLAYBACK_MAX_AGE_SEC * 1000;
    const sig = crypto.createHmac('sha256', getKey()).update(`play1:${token}:${exp}`).digest('base64url');
    return { e: exp, s: sig };
}

export function verifyPlaybackGrant(token, expRaw, sig) {
    const exp = Number(expRaw);
    const maxExp = Date.now() + PLAYBACK_MAX_AGE_SEC * 1000 + 5000;
    if (!Number.isFinite(exp) || exp < Date.now() || exp > maxExp) return false;
    if (typeof sig !== 'string' || !/^[A-Za-z0-9_-]{20,200}$/.test(sig)) return false;
    const expected = crypto.createHmac('sha256', getKey()).update(`play1:${token}:${exp}`).digest('base64url');
    return timingEqual(sig, expected);
}

function noteHit(ip, bucket, limit) {
    const now = Date.now();
    const key = `${bucket}:${ip || 'unknown'}`;
    const recent = (hits.get(key) || []).filter((t) => now - t < 60_000);
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) {
        for (const [k, list] of hits) {
            if (!list.length || now - list[list.length - 1] > 60_000) hits.delete(k);
        }
    }
    return recent.length <= limit;
}

export function allowWatchAttempt(ip, bucket, limit) {
    return noteHit(ip, bucket, limit);
}

function toFinalVideoRelative(link) {
    let p = String(link || '').trim().replace(/\\/g, '/');
    if (!p || /^https?:\/\//i.test(p)) return null;
    if (p.startsWith('/api/uploads/')) p = 'uploads/' + p.slice('/api/uploads/'.length);
    else if (p.startsWith('api/uploads/')) p = 'uploads/' + p.slice('api/uploads/'.length);
    else if (p.startsWith('/uploads/')) p = p.slice(1);
    else if (!p.startsWith('uploads/')) return null;

    p = path.posix.normalize(p);
    if (!p.startsWith('uploads/final-videos/')) return null;
    if (p.includes('..')) return null;
    const under = p.slice('uploads/'.length);
    const ext = path.posix.extname(under).toLowerCase();
    if (!PLAYABLE_EXT.has(ext)) return null;
    if (under.split('/').some((part) => !part || part === '.' || part === '..')) return null;
    return { under, ext };
}

async function findFinalVideoFile(under) {
    const bases = [
        process.env.APP_BASE_DIR,
        process.cwd(),
        path.resolve(process.cwd(), '..', '..'),
        '/opt/wmp16',
        '/opt/wmp',
    ].filter(Boolean);

    const suffixes = [
        ['public', 'uploads'],
        ['public', 'public', 'uploads'],
    ];

    for (const base of bases) {
        for (const suffix of suffixes) {
            const dir = path.resolve(path.join(base, ...suffix));
            const candidate = path.resolve(path.join(dir, ...under.split('/')));
            if (!candidate.startsWith(dir + path.sep)) continue;
            try {
                const realDir = await fs.realpath(dir);
                const realFile = await fs.realpath(candidate);
                const inside = realFile.startsWith(realDir + path.sep);
                const inFinal = realFile.includes(`${path.sep}final-videos${path.sep}`);
                if (!inside || !inFinal) continue;
                const st = await fs.stat(realFile);
                if (!st.isFile() || st.size <= 0) continue;
                return realFile;
            } catch {
                // try the next location
            }
        }
    }
    return null;
}

export async function resolveFinalVideo(requestId) {
    const cached = fileCache.get(requestId);
    if (cached && cached.expires > Date.now()) return cached.value;

    const result = await query(
        `SELECT link
         FROM final_videos
         WHERE work_request_id = $1
           AND link IS NOT NULL
         ORDER BY id DESC
         LIMIT 1`,
        [requestId]
    );

    const link = result.rows[0]?.link;
    const relative = link ? toFinalVideoRelative(link) : null;
    const fullPath = relative ? await findFinalVideoFile(relative.under) : null;
    const value = fullPath
        ? { fullPath, contentType: CONTENT_TYPES[relative.ext] }
        : null;

    fileCache.set(requestId, {
        value,
        expires: Date.now() + (value ? FILE_CACHE_MS : MISS_CACHE_MS),
    });
    return value;
}

export function openVideoStream(fullPath, start, end) {
    const nodeStream = createReadStream(fullPath, { start, end });
    return Readable.toWeb(nodeStream);
}

export function parseByteRange(header, size) {
    if (!header) return null;
    const match = /^bytes=(\d*)-(\d*)$/.exec(String(header).trim());
    if (!match) return { invalid: true };
    const startStr = match[1];
    const endStr = match[2];
    if (startStr === '' && endStr === '') return { invalid: true };

    let start;
    let end;
    if (startStr === '') {
        const suffix = Number(endStr);
        if (!Number.isInteger(suffix) || suffix <= 0) return { invalid: true };
        start = Math.max(size - suffix, 0);
        end = size - 1;
    } else {
        start = Number(startStr);
        end = endStr === '' ? size - 1 : Number(endStr);
    }

    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || start >= size) {
        return { invalid: true };
    }
    return { start, end: Math.min(end, size - 1) };
}
