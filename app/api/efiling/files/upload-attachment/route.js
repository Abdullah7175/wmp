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
        
        // For demo purposes, we'll store the file info in the database
        // In production, you would upload the file to a cloud storage service
        const fileName = file.name;
        const fileSize = file.size;
        const fileType = file.type;
        
        // Generate a unique attachment ID
        const attachmentId = Date.now().toString();
        
        // Get user ID from request headers or session (in production, get from authentication)
        const userId = request.headers.get('x-user-id') || 'system';
        
        // Store attachment information in the database
        const result = await client.query(`
            INSERT INTO efiling_file_attachments (
                id, file_id, file_name, file_size, file_type, 
                uploaded_by, uploaded_at, is_active, attachment_name
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), true, $7)
            RETURNING *
        `, [attachmentId, fileId, fileName, fileSize, fileType, userId, attachmentName || 'Unnamed']);
        
        const attachment = result.rows[0];
        
        // Log the action using efiling action logger
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
        
        // In production, you would also:
        // 1. Upload the file to cloud storage (AWS S3, Google Cloud Storage, etc.)
        // 2. Store the file URL in the database
        // 3. Process the file if needed (virus scan, etc.)
        
        console.log(`Attachment uploaded: ${fileName} for file ${fileId}`);
        
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
