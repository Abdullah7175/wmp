import { NextResponse } from 'next/server';
import { join, resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CONTENT_TYPES = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
};

export async function GET(request, { params }) {
    let client;
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'Attachment ID is required' }, { status: 400 });
        }

        client = await connectToDatabase();
        if (!client) {
            return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
        }

        const efilingRes = await client.query(
            `SELECT id FROM efiling_users WHERE user_id = $1 AND is_active = true LIMIT 1`,
            [session.user.id]
        );
        const efilingUserId = efilingRes.rows[0]?.id;

        const attachmentRes = await client.query(
            `
            SELECT id, file_name, file_type, file_url, uploaded_by
            FROM efiling_file_attachments
            WHERE id = $1 AND COALESCE(is_active, true) = true
            LIMIT 1
            `,
            [String(id)]
        );

        if (attachmentRes.rows.length === 0) {
            return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
        }

        const attachment = attachmentRes.rows[0];
        const uploader = String(attachment.uploaded_by || '');
        const allowed = [String(session.user.id), efilingUserId != null ? String(efilingUserId) : null].filter(Boolean);
        if (!allowed.includes(uploader)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const extFromName = String(attachment.file_name || attachment.file_url || '').split('.').pop()?.toLowerCase();
        const storedFileName = `${attachment.id}.${extFromName || 'bin'}`;
        const relativeSegments = ['efiling', 'attachments', storedFileName];

        const cwd = process.cwd();
        const candidateBaseDirs = [
            process.env.APP_BASE_DIR,
            cwd,
            resolve(join(cwd, '.next', 'standalone')),
            '/opt/wmp16',
            '/opt/wmp',
            resolve(join(cwd, '..', '..')),
        ].filter(Boolean);

        let fullPath = null;
        for (const baseDir of candidateBaseDirs) {
            const dir = resolve(join(baseDir, 'public', 'uploads'));
            const candidatePath = resolve(join(dir, ...relativeSegments));
            if (!candidatePath.startsWith(dir)) continue;
            if (existsSync(candidatePath)) {
                fullPath = candidatePath;
                break;
            }
        }

        if (!fullPath) {
            return new NextResponse('File not found', { status: 404 });
        }

        const extension = storedFileName.split('.').pop()?.toLowerCase();
        const contentType = CONTENT_TYPES[extension] || attachment.file_type || 'application/octet-stream';
        const inline = Boolean(CONTENT_TYPES[extension]);
        const contentDisposition = `${inline ? 'inline' : 'attachment'}; filename="${attachment.file_name || storedFileName}"`;

        const nginxServedRoot = process.env.APP_BASE_DIR || '/opt/wmp16';
        const nginxUploadsDir = resolve(join(nginxServedRoot, 'public', 'uploads'));
        if (fullPath.startsWith(nginxUploadsDir)) {
            return new NextResponse(null, {
                status: 200,
                headers: {
                    'Content-Type': contentType,
                    'X-Accel-Redirect': `/protected/uploads/${relativeSegments.join('/')}`,
                    'Content-Disposition': contentDisposition,
                    'Cache-Control': 'private, max-age=3600',
                },
            });
        }

        const body = readFileSync(fullPath);
        return new NextResponse(body, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': contentDisposition,
                'Cache-Control': 'private, max-age=3600',
            },
        });
    } catch (error) {
        console.error('[my-attachments] error:', error);
        return NextResponse.json({ error: 'Failed to load attachment' }, { status: 500 });
    } finally {
        if (client && typeof client.release === 'function') {
            try {
                client.release();
            } catch {}
        }
    }
}
