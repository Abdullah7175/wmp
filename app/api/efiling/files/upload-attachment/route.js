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
        
        const fileName = file.name;
        const fileSize = file.size;
        const fileType = file.type;
        
        // Validate file size (5MB max for attachments)
        if (fileSize > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File size exceeds limit. Maximum allowed: 5MB' },
                { status: 400 }
            );
        }
        
        const attachmentId = Date.now().toString();
        
        const userId = request.headers.get('x-user-id') || 'system';
        
        // Create upload directory if it doesn't exist
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'efiling', 'attachments');
        await mkdir(uploadDir, { recursive: true });
        
        // Generate unique filename
        const fileExtension = fileName.split('.').pop();
        const uniqueFileName = `${attachmentId}.${fileExtension}`;
        const filePath = join(uploadDir, uniqueFileName);
        
        // Save file to disk
        const fileBuffer = await file.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(fileBuffer));
        
        // Generate public URL
        const fileUrl = `/uploads/efiling/attachments/${uniqueFileName}`;
        
        // Store attachment information with file URL
        const result = await client.query(`
            INSERT INTO efiling_file_attachments (
                id, file_id, file_name, file_size, file_type, file_url,
                uploaded_by, uploaded_at, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), true)
            RETURNING *
        `, [attachmentId, fileId, fileName, fileSize, fileType, fileUrl, userId]);
        
        const attachment = result.rows[0];
        
        await eFileActionLogger.logAction({
            entityType: EFILING_ENTITY_TYPES.EFILING_ATTACHMENT,
            entityId: attachmentId,
            action: EFILING_ACTION_TYPES.DOCUMENT_UPLOADED,
            userId: userId,
            details: {
                fileId: fileId,
                fileName: fileName,
                fileSize: fileSize,
                fileType: fileType,
                attachmentName: attachmentName || 'Unnamed',
                description: `Attachment "${fileName}" uploaded to file ${fileId}`
            },
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
            userAgent: request.headers.get('user-agent')
        });

        // Also log a file-level action for timeline aggregation
        await eFileActionLogger.logFileAction({
            fileId: fileId,
            action: EFILING_ACTION_TYPES.DOCUMENT_UPLOADED,
            userId: userId,
            details: {
                description: `Attachment uploaded: ${fileName}`,
                attachmentId,
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
