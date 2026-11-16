import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

/**
 * Map DB / UI media links to a path under public/uploads.
 * Examples:
 *   /api/uploads/final-videos/a.mp4 → uploads/final-videos/a.mp4
 *   /uploads/final-videos/a.mp4     → uploads/final-videos/a.mp4
 *   uploads/final-videos/a.mp4      → uploads/final-videos/a.mp4
 */
function toUploadsRelativePath(filePath) {
    let p = String(filePath || '').trim().replace(/\\/g, '/');

    if (p.startsWith('/api/uploads/')) {
        p = 'uploads/' + p.slice('/api/uploads/'.length);
    } else if (p.startsWith('api/uploads/')) {
        p = 'uploads/' + p.slice('api/uploads/'.length);
    } else if (p.startsWith('/uploads/')) {
        p = p.slice(1);
    } else if (!p.startsWith('uploads/')) {
        // Bare filename or unexpected path — keep under uploads/
        p = path.posix.join('uploads', p.replace(/^\//, ''));
    }

    return path.normalize(p).replace(/^(\.\.(\/|\\|$))+/, '');
}

export async function GET(request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const filePath = searchParams.get('path');

        if (!filePath) {
            return NextResponse.json({ error: 'File path is required' }, { status: 400 });
        }

        // SECURITY: Validate and sanitize path to prevent path traversal
        if (filePath.includes('..')) {
            return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
        }

        const relativeUploadsPath = toUploadsRelativePath(filePath);
        if (relativeUploadsPath.includes('..') || !relativeUploadsPath.startsWith('uploads')) {
            return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
        }

        const candidateBases = [
            process.env.APP_BASE_DIR,
            process.cwd(),
            '/opt/wmp16',
            '/opt/wmp',
        ].filter(Boolean);

        // Prefer public/uploads, then nested public/public/uploads (legacy dual tree)
        const uploadRootSuffixes = [
            ['public', 'uploads'],
            ['public', 'public', 'uploads'],
        ];

        let fullPath = null;
        let uploadsDir = null;

        // relativeUploadsPath is like "uploads/final-videos/x.mp4" — strip leading "uploads/"
        const underUploads = relativeUploadsPath.replace(/^uploads[/\\]/, '');

        for (const base of candidateBases) {
            for (const suffix of uploadRootSuffixes) {
                const dir = path.resolve(path.join(base, ...suffix));
                const candidate = path.resolve(path.join(dir, underUploads));
                if (!candidate.startsWith(dir)) continue;
                try {
                    await fs.access(candidate);
                    fullPath = candidate;
                    uploadsDir = dir;
                    break;
                } catch {
                    // try next root
                }
            }
            if (fullPath) break;
        }

        if (!fullPath || !uploadsDir) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // Get file stats
        const stats = await fs.stat(fullPath);
        const fileSize = stats.size;
        const fileName = path.basename(fullPath);
        const ext = path.extname(fileName).toLowerCase();

        // Determine content type based on file extension
        let contentType = 'application/octet-stream';
        const contentTypes = {
            '.mp4': 'video/mp4',
            '.m4v': 'video/mp4',
            '.mov': 'video/quicktime',
            '.avi': 'video/avi',
            '.mkv': 'video/mkv',
            '.webm': 'video/webm',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };

        if (contentTypes[ext]) {
            contentType = contentTypes[ext];
        }

        const fileBuffer = await fs.readFile(fullPath);

        const headers = new Headers();
        headers.set('Content-Type', contentType);
        headers.set('Content-Length', fileSize.toString());

        const download = searchParams.get('download');
        if (download === 'true' || download === '1') {
            headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
        } else if (contentType.startsWith('video/')) {
            headers.set('Content-Disposition', `inline; filename="${fileName}"`);
        } else {
            headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
        }

        headers.set('Cache-Control', 'public, max-age=31536000');

        if (contentType.startsWith('video/')) {
            headers.set('Accept-Ranges', 'bytes');
        }

        return new NextResponse(fileBuffer, {
            status: 200,
            headers
        });

    } catch (error) {
        console.error('Error serving file:', error);
        return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
    }
}
