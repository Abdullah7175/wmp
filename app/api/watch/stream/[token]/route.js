import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { getClientIp } from '@/middleware/validateNetwork';
import {
    allowWatchAttempt,
    openVideoStream,
    parseByteRange,
    readWatchToken,
    resolveFinalVideo,
    verifyPlaybackGrant,
} from '@/lib/watchLink';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function denied(status = 404) {
    return new NextResponse(null, {
        status,
        headers: {
            'Cache-Control': 'no-store',
            'X-Content-Type-Options': 'nosniff',
        },
    });
}

export async function GET(request, context) {
    try {
        const site = request.headers.get('sec-fetch-site');
        if (site && site !== 'same-origin') return denied();

        const dest = request.headers.get('sec-fetch-dest');
        if (dest && dest !== 'video' && dest !== 'empty') return denied();

        const { token } = await context.params;
        const requestId = readWatchToken(token);
        if (!requestId) {
            const ip = getClientIp(request);
            if (!allowWatchAttempt(ip, 'bad-stream', 30)) return denied(429);
            return denied();
        }

        const url = new URL(request.url);
        if (!verifyPlaybackGrant(token, url.searchParams.get('e'), url.searchParams.get('s'))) {
            return denied(401);
        }

        const video = await resolveFinalVideo(requestId);
        if (!video) return denied();

        const stats = await fs.stat(video.fullPath);
        const size = stats.size;
        if (!size) return denied();

        const range = parseByteRange(request.headers.get('range'), size);
        if (range?.invalid) {
            return new NextResponse(null, {
                status: 416,
                headers: { 'Content-Range': `bytes */${size}` },
            });
        }

        const start = range ? range.start : 0;
        const end = range ? range.end : size - 1;
        const nodeStream = openVideoStream(video.fullPath, start, end);
        if (request.signal) {
            const abort = () => {
                try { nodeStream.cancel?.(); } catch { /* already closed */ }
            };
            if (request.signal.aborted) abort();
            else request.signal.addEventListener('abort', abort, { once: true });
        }

        const headers = {
            'Content-Type': video.contentType,
            'Content-Length': String(end - start + 1),
            'Accept-Ranges': 'bytes',
            'Content-Disposition': 'inline',
            'Cache-Control': 'private, no-store',
            'X-Content-Type-Options': 'nosniff',
            'Referrer-Policy': 'no-referrer',
            'Cross-Origin-Resource-Policy': 'same-origin',
            'Content-Security-Policy': "default-src 'none'",
        };
        if (range) {
            headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
        }

        return new NextResponse(nodeStream, {
            status: range ? 206 : 200,
            headers,
        });
    } catch (error) {
        console.error('Watch stream error:', error?.message || error);
        return denied(500);
    }
}
