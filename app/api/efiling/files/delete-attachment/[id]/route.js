import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { eFileActionLogger, EFILING_ACTION_TYPES, EFILING_ENTITY_TYPES } from '@/lib/efilingActionLogger';

export async function DELETE(request, { params }) {
    let client;
    try {
        const { id } = await params;
        
        if (!id) {
            return NextResponse.json(
                { error: 'Attachment ID is required' },
                { status: 400 }
            );
        }

        client = await connectToDatabase();
        
        // Get attachment info before deletion for logging
        const attachmentResult = await client.query(`
            SELECT file_id, file_name, file_size, file_type, attachment_name FROM efiling_file_attachments WHERE id = $1
        `, [id]);
        
        if (attachmentResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Attachment not found' },
                { status: 404 }
            );
        }
        
        const attachment = attachmentResult.rows[0];
        
        // Get user ID from request headers or session (in production, get from authentication)
        const userId = request.headers.get('x-user-id') || 'system';
        
        // Soft delete the attachment (mark as inactive)
        await client.query(`
            UPDATE efiling_file_attachments 
            SET is_active = false, deleted_at = NOW()
            WHERE id = $1
        `, [id]);
        
        // Log the action using efiling action logger
        await eFileActionLogger.logAction({
            entityType: EFILING_ENTITY_TYPES.EFILING_ATTACHMENT,
            entityId: id,
            action: EFILING_ACTION_TYPES.DOCUMENT_DELETED,
            userId: userId,
            details: {
                fileId: attachment.file_id,
                fileName: attachment.file_name,
                fileSize: attachment.file_size,
                fileType: attachment.file_type,
                attachmentName: attachment.attachment_name,
                description: `Attachment "${attachment.file_name}" deleted from file ${attachment.file_id}`
            },
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
            userAgent: request.headers.get('user-agent')
        });
        
        // In production, you would also:
        // 1. Delete the file from cloud storage
        // 2. Update any references to this attachment
        
        console.log(`Attachment deleted: ${attachment.file_name}`);
        
        return NextResponse.json({
            success: true,
            message: 'Attachment deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting attachment:', error);
        return NextResponse.json(
            { error: 'Failed to delete attachment' },
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.release();
        }
    }
}
