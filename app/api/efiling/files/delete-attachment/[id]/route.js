import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { eFileActionLogger, EFILING_ACTION_TYPES, EFILING_ENTITY_TYPES } from '@/lib/efilingActionLogger';
import { auth } from '@/auth';
import { checkFileAccess } from '@/lib/authMiddleware';

export async function DELETE(request, { params }) {
    let client;
    try {
        // SECURITY: Require authentication
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
        
        const { id } = await params;
        
        if (!id) {
            return NextResponse.json(
                { error: 'Attachment ID is required' },
                { status: 400 }
            );
        }

        client = await connectToDatabase();
        
        // Get attachment info including uploaded_by for ownership verification
        const attachmentResult = await client.query(`
            SELECT file_id, file_name, file_size, file_type, file_url, uploaded_by 
            FROM efiling_file_attachments 
            WHERE id = $1 AND is_active = true
        `, [id]);
        
        if (attachmentResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Attachment not found' },
                { status: 404 }
            );
        }
        
        const attachment = attachmentResult.rows[0];
        const fileId = attachment.file_id;
        const userId = session.user.id; // users.id from session
        const isAdmin = session.user.role && [1, 2].includes(parseInt(session.user.role));

        // Get efiling_user ID for regular users
        let efilingUserId = null;
        if (!isAdmin) {
            const efilingUserResult = await client.query(
                `SELECT id FROM efiling_users WHERE user_id = $1 AND is_active = true LIMIT 1`,
                [userId]
            );
            if (efilingUserResult.rows.length > 0) {
                efilingUserId = efilingUserResult.rows[0].id;
            }
        }

        // ------------------------------------------------------------------
        // CHECK 1: Creator Ownership Check
        // Only the user who created/uploaded the attachment (or an Admin) can delete it
        // ------------------------------------------------------------------
        const isAttachmentCreator = attachment.uploaded_by && (
            String(attachment.uploaded_by) === String(userId) || 
            (efilingUserId && String(attachment.uploaded_by) === String(efilingUserId))
        );

        if (!isAdmin && !isAttachmentCreator) {
            return NextResponse.json(
                { error: 'Forbidden - Only the creator can delete this attachment' },
                { status: 403 }
            );
        }

        // ------------------------------------------------------------------
        // CHECK 2: File Assignment Check (Ditto same check as comments edit/delete)
        // Verify current assignment status: File must be currently assigned to this user OR currently unassigned (NULL)
        // ------------------------------------------------------------------
        const fileCheckResult = await client.query(
            `SELECT assigned_to FROM efiling_files WHERE id = $1`,
            [fileId]
        );

        if (fileCheckResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Associated file not found' },
                { status: 404 }
            );
        }

        const currentAssignedTo = fileCheckResult.rows[0].assigned_to;

        if (!isAdmin) {
            const isAssignedToUser = efilingUserId && currentAssignedTo === efilingUserId;
            const isUnassigned = currentAssignedTo === null;

            if (!isAssignedToUser && !isUnassigned) {
                return NextResponse.json(
                    { error: 'Forbidden - You can only delete attachments when the file is assigned to you or unassigned' },
                    { status: 403 }
                );
            }
        }
        
        // SECURITY: Check standard file access permissions
        const hasAccess = await checkFileAccess(client, fileId, userId, isAdmin);
        if (!hasAccess) {
            return NextResponse.json(
                { error: 'Forbidden - You do not have permission to delete this attachment' },
                { status: 403 }
            );
        }
        
        // Soft delete the attachment (mark as inactive)
        await client.query(`
            UPDATE efiling_file_attachments 
            SET is_active = false
            WHERE id = $1
        `, [id]);
        
        // Resolve user ID for audit log
        let logUserId = userId.toString();
        if (!isAdmin && efilingUserId) {
            logUserId = efilingUserId.toString();
        }
        
        // Log action via action logger
        await eFileActionLogger.logAction({
            entityType: EFILING_ENTITY_TYPES.EFILING_ATTACHMENT,
            entityId: id,
            action: EFILING_ACTION_TYPES.DOCUMENT_DELETED,
            userId: logUserId,
            details: {
                fileId: attachment.file_id,
                fileName: attachment.file_name,
                fileSize: attachment.file_size,
                fileType: attachment.file_type,
                fileUrl: attachment.file_url,
                description: `Attachment "${attachment.file_name}" deleted from file ${attachment.file_id}`
            },
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
            userAgent: request.headers.get('user-agent')
        });
        
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