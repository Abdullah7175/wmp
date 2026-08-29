import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { eFileActionLogger, EFILING_ACTION_TYPES, EFILING_ENTITY_TYPES } from '@/lib/efilingActionLogger';
import { promises as fs } from 'fs';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export async function POST(request) {
    let client;
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const fileId = formData.get('fileId');
        const attachmentName = formData.get('attachmentName');
        
        if (!file || !fileId) {
            return NextResponse.json(
                { error: 'File and file ID are required' },
                { status: 400 }
            );
        }

        client = await connectToDatabase();

        // Ensure preferred-name column exists
        await client.query(`
            ALTER TABLE public.efiling_file_attachments
            ADD COLUMN IF NOT EXISTS attachment_name varchar(255) NULL
        `);
        
        const fileName = file.name;
        const preferredName = (typeof attachmentName === 'string' ? attachmentName.trim() : '') || null;
        const fileSize = file.size;
        const fileType = file.type;
        
        // Validate file size (10MB max for attachments)
        if (fileSize > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File size exceeds limit. Maximum allowed: 10MB' },
                { status: 400 }
            );
        }

        // Block CC-only viewers from uploading attachments
        try {
            const { auth } = await import('@/auth');
            const { rejectCcOnlyMutation } = await import('@/lib/authMiddleware');
            const session = await auth();
            if (session?.user?.id) {
                const isAdmin = [1, 2].includes(parseInt(session.user.role));
                const ccBlock = await rejectCcOnlyMutation(client, parseInt(fileId), session.user.id, isAdmin);
                if (ccBlock) return ccBlock;
            }
        } catch (ccGuardError) {
            console.warn('[upload-attachment] CC guard skipped:', ccGuardError.message);
        }
        
        const attachmentId = Date.now().toString();
        
        const userId = request.headers.get('x-user-id') || 'system';
        
        // Handle standalone mode - get correct base directory
        let baseDir = process.cwd();
        if (baseDir.includes('.next/standalone') || baseDir.includes('.next\\standalone')) {
            // In standalone mode, go up two levels to get to project root
            baseDir = join(baseDir, '..', '..');
        }
        
        // Create upload directory if it doesn't exist
        const uploadDir = join(baseDir, 'public', 'uploads', 'efiling', 'attachments');
        await mkdir(uploadDir, { recursive: true });
        
        // Generate unique filename
        const fileExtension = fileName.split('.').pop();
        const uniqueFileName = `${attachmentId}.${fileExtension}`;
        const filePath = join(uploadDir, uniqueFileName);
        
        // Save file to disk
        const fileBuffer = await file.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(fileBuffer));
        
        // Verify file was saved successfully
        try {
            const stats = await fs.stat(filePath);
            if (!stats.isFile()) {
                throw new Error('File was not saved correctly');
            }
            console.log(`File uploaded successfully: ${filePath} (${stats.size} bytes)`);
            console.log(`File URL: /uploads/efiling/attachments/${uniqueFileName}`);
        } catch (verifyError) {
            console.error(`Error verifying uploaded file: ${verifyError.message}`);
            throw new Error('Failed to verify uploaded file');
        }
        
        // Generate public URL - use /api/uploads/ to ensure it goes through authenticated route
        const fileUrl = `/api/uploads/efiling/attachments/${uniqueFileName}`;
        
        // Store attachment information with file URL and user-preferred name
        const result = await client.query(`
            INSERT INTO efiling_file_attachments (
                id, file_id, file_name, attachment_name, file_size, file_type, file_url,
                uploaded_by, uploaded_at, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), true)
            RETURNING *
        `, [attachmentId, fileId, fileName, preferredName, fileSize, fileType, fileUrl, userId]);
        
        const attachment = result.rows[0];
        const displayName = preferredName || fileName;
        
        // Get user name for notifications
        let userName = 'System';
        let efilingUserId = userId;
        try {
            // userId from header might be efiling_users.id or users.id - check both
            const userRes = await client.query(`
                SELECT eu.id as efiling_id, u.id as user_id, u.name
                FROM efiling_users eu
                JOIN users u ON eu.user_id = u.id
                WHERE eu.id = $1
                LIMIT 1
            `, [userId]);
            if (userRes.rows.length > 0) {
                userName = userRes.rows[0].name;
                efilingUserId = userRes.rows[0].efiling_id || userId;
            }
        } catch (e) {
            console.error('Error getting user name for notifications:', e);
        }
        
        // Notify file creator and all users who have been marked to this file
        try {
            // Get file creator and current assignee
            const fileMeta = await client.query(`
                SELECT f.created_by, f.assigned_to
                FROM efiling_files f
                WHERE f.id = $1
            `, [fileId]);
            
            if (fileMeta.rows.length > 0) {
                const createdBy = fileMeta.rows[0]?.created_by;
                const currentAssignee = fileMeta.rows[0]?.assigned_to;
                
                // Notify creator (if not the uploader)
                if (createdBy && createdBy.toString() !== efilingUserId.toString()) {
                    await client.query(`
                        INSERT INTO efiling_notifications (user_id, file_id, type, message, priority, action_required, created_at)
                        VALUES ($1, $2, $3, $4, 'normal', true, NOW())
                    `, [createdBy, fileId, 'attachment_added', `${userName} added an attachment "${displayName}" to file`]);
                }
                
                // Notify current assignee (if not creator and not uploader)
                if (currentAssignee && currentAssignee.toString() !== createdBy?.toString() && currentAssignee.toString() !== efilingUserId.toString()) {
                    await client.query(`
                        INSERT INTO efiling_notifications (user_id, file_id, type, message, priority, action_required, created_at)
                        VALUES ($1, $2, $3, $4, 'normal', true, NOW())
                    `, [currentAssignee, fileId, 'attachment_added', `${userName} added an attachment "${displayName}" to file`]);
                }
                
                // Notify all users who have been marked to this file
                const markedUsers = await client.query(`
                    SELECT DISTINCT to_user_id
                    FROM efiling_file_movements
                    WHERE file_id = $1 AND to_user_id IS NOT NULL
                `, [fileId]);
                
                for (const markedUser of markedUsers.rows) {
                    const markedUserId = markedUser.to_user_id;
                    // Skip if already notified (creator or assignee) or is the uploader
                    if (markedUserId.toString() !== createdBy?.toString() && markedUserId.toString() !== currentAssignee?.toString() && markedUserId.toString() !== efilingUserId.toString()) {
                        await client.query(`
                            INSERT INTO efiling_notifications (user_id, file_id, type, message, priority, action_required, created_at)
                            VALUES ($1, $2, $3, $4, 'normal', false, NOW())
                        `, [markedUserId, fileId, 'attachment_added', `${userName} added an attachment "${displayName}" to file`]);
                    }
                }
            }
        } catch (notifyError) {
            console.error('Error creating attachment notifications:', notifyError);
            // Don't fail the request if notifications fail
        }
        
        await eFileActionLogger.logAction({
            entityType: EFILING_ENTITY_TYPES.EFILING_ATTACHMENT,
            entityId: attachmentId,
            action: EFILING_ACTION_TYPES.DOCUMENT_UPLOADED,
            userId: efilingUserId.toString(),
            details: {
                fileId: fileId,
                fileName: fileName,
                attachmentName: preferredName || 'Unnamed',
                fileSize: fileSize,
                fileType: fileType,
                description: `Attachment "${displayName}" uploaded to file ${fileId}`
            },
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
            userAgent: request.headers.get('user-agent')
        });

        // Also log a file-level action for timeline aggregation
        await eFileActionLogger.logFileAction({
            fileId: fileId,
            action: EFILING_ACTION_TYPES.DOCUMENT_UPLOADED,
            userId: efilingUserId.toString(),
            details: {
                description: `Attachment uploaded: ${displayName}`,
                attachmentId,
                fileName,
                attachmentName: preferredName,
                fileType,
                fileSize
            },
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
            userAgent: request.headers.get('user-agent')
        });
        
        return NextResponse.json({
            success: true,
            attachment: {
                id: attachment.id,
                name: attachment.file_name,
                file_name: attachment.file_name,
                attachment_name: attachment.attachment_name,
                size: attachment.file_size,
                type: attachment.file_type,
                url: attachment.file_url,
                uploadedAt: attachment.uploaded_at
            }
        });
        
    } catch (error) {
        console.error('Error uploading attachment:', error);
        return NextResponse.json(
            { error: 'Failed to upload attachment' },
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.release();
        }
    }
}
