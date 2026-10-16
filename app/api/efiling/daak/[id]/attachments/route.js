import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { auth } from '@/auth';
import { promises as fs } from 'fs';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { ensureDaakLetterSchema } from '@/lib/efilingDaakHelpers';

export const dynamic = 'force-dynamic';

async function getEfilingUserId(session, client) {
    const efilingUser = await client.query(
        'SELECT id FROM efiling_users WHERE user_id = $1 AND is_active = true',
        [session.user.id]
    );
    return efilingUser.rows[0]?.id || null;
}

// POST - Upload attachment for a daak (draft or creator/admin)
export async function POST(request, { params }) {
    let client;
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const formData = await request.formData();
        const file = formData.get('file');
        const attachmentNameRaw = formData.get('attachmentName');
        const preferredName =
            (typeof attachmentNameRaw === 'string' ? attachmentNameRaw.trim() : '') || null;

        if (!file) {
            return NextResponse.json({ error: 'File is required' }, { status: 400 });
        }

        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File size exceeds limit. Maximum allowed: 10MB' },
                { status: 400 }
            );
        }

        client = await connectToDatabase();
        await ensureDaakLetterSchema(client);
        const efilingUserId = await getEfilingUserId(session, client);
        const isAdmin = [1, 2].includes(parseInt(session.user.role));

        const daakRes = await client.query(
            'SELECT id, created_by, status FROM efiling_daak WHERE id = $1',
            [id]
        );
        if (daakRes.rows.length === 0) {
            return NextResponse.json({ error: 'Daak not found' }, { status: 404 });
        }

        const daak = daakRes.rows[0];
        if (daak.created_by !== efilingUserId && !isAdmin) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
        if (daak.status === 'SENT' && !isAdmin) {
            return NextResponse.json(
                { error: 'Cannot add attachments after daak has been sent' },
                { status: 400 }
            );
        }

        let baseDir = process.cwd();
        if (baseDir.includes('.next/standalone') || baseDir.includes('.next\\standalone')) {
            baseDir = join(baseDir, '..', '..');
        }

        const uploadDir = join(baseDir, 'public', 'uploads', 'efiling', 'daak');
        await mkdir(uploadDir, { recursive: true });

        const fileName = file.name;
        const fileExtension = fileName.includes('.') ? fileName.split('.').pop() : 'bin';
        const uniqueName = `${id}-${Date.now()}.${fileExtension}`;
        const filePath = join(uploadDir, uniqueName);

        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, buffer);

        const publicUrl = `/api/uploads/efiling/daak/${uniqueName}`;

        const insert = await client.query(
            `INSERT INTO efiling_daak_attachments
                (daak_id, file_name, attachment_name, file_path, file_size, file_type, uploaded_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                id,
                fileName,
                preferredName,
                publicUrl,
                file.size,
                file.type || null,
                efilingUserId,
            ]
        );

        return NextResponse.json({
            success: true,
            attachment: insert.rows[0],
        });
    } catch (error) {
        console.error('Error uploading daak attachment:', error);
        return NextResponse.json(
            { error: 'Failed to upload attachment', details: error.message },
            { status: 500 }
        );
    } finally {
        if (client) await client.release();
    }
}

// DELETE - Delete an attachment from a daak
export async function DELETE(request, { params }) {
    let client;
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params; // daak ID
        const { searchParams } = new URL(request.url);
        const attachmentId = searchParams.get('attachmentId');

        if (!attachmentId) {
            return NextResponse.json({ error: 'Attachment ID is required' }, { status: 400 });
        }

        client = await connectToDatabase();
        const efilingUserId = await getEfilingUserId(session, client);
        const isAdmin = [1, 2].includes(parseInt(session.user.role));

        // Verify daak ownership/permissions and status
        const daakRes = await client.query(
            'SELECT id, created_by, status FROM efiling_daak WHERE id = $1',
            [id]
        );
        if (daakRes.rows.length === 0) {
            return NextResponse.json({ error: 'Daak not found' }, { status: 404 });
        }

        const daak = daakRes.rows[0];
        if (daak.created_by !== efilingUserId && !isAdmin) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
        if (daak.status === 'SENT' && !isAdmin) {
            return NextResponse.json(
                { error: 'Cannot delete attachments after daak has been sent' },
                { status: 400 }
            );
        }

        // Fetch attachment record
        const attRes = await client.query(
            'SELECT * FROM efiling_daak_attachments WHERE id = $1 AND daak_id = $2',
            [attachmentId, id]
        );

        if (attRes.rows.length === 0) {
            return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
        }

        const attachment = attRes.rows[0];

        // Try deleting the physical file on disk
        if (attachment.file_path) {
            try {
                let baseDir = process.cwd();
                if (baseDir.includes('.next/standalone') || baseDir.includes('.next\\standalone')) {
                    baseDir = join(baseDir, '..', '..');
                }
                
                // Convert relative URL like /api/uploads/efiling/daak/filename.jpg to relative disk path
                const relativePath = attachment.file_path.replace('/api/uploads/', '');
                const diskPath = join(baseDir, 'public', 'uploads', relativePath);
                
                await fs.unlink(diskPath);
            } catch (fsErr) {
                console.warn('Physical file deletion warning:', fsErr.message);
            }
        }

        // Delete row from database
        await client.query(
            'DELETE FROM efiling_daak_attachments WHERE id = $1 AND daak_id = $2',
            [attachmentId, id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting daak attachment:', error);
        return NextResponse.json(
            { error: 'Failed to delete attachment', details: error.message },
            { status: 500 }
        );
    } finally {
        if (client) await client.release();
    }
}