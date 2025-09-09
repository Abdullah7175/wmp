import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { eFileActionLogger, EFILING_ACTION_TYPES, EFILING_ENTITY_TYPES } from '@/lib/efilingActionLogger';

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
        
        const attachmentId = Date.now().toString();
        
        const userId = request.headers.get('x-user-id') || 'system';
        
        // Store attachment information in existing columns
        const result = await client.query(`
            INSERT INTO efiling_file_attachments (
                id, file_id, file_name, file_size, file_type, 
                uploaded_by, uploaded_at, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), true)
            RETURNING *
        `, [attachmentId, fileId, fileName, fileSize, fileType, userId]);
        
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
