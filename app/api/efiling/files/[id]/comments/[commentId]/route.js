import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { logAction } from '@/lib/actionLogger';

async function verifyPermissions(client, fileId, commentId, requestUserId) {
    console.log('\n--- VERIFY PERMISSIONS START ---');
    console.log('Incoming Params:', { fileId, commentId, requestUserId });

    // Validate that commentId consists strictly of digits (supports INT & BIGINT)
    if (!commentId || !/^\d+$/.test(String(commentId))) { 
        console.log('FAIL: Invalid comment ID format passed:', commentId);
        return { status: 400, error: 'Invalid comment ID format' };
    }

    // 1. Fetch comment details
    const commentCheck = await client.query(`
        SELECT user_id FROM efiling_document_comments 
        WHERE id::text = $1::text AND file_id::text = $2::text AND is_active = TRUE
    `, [String(commentId), String(fileId)]);

    console.log('1. Comment Query Result:', commentCheck.rows);

    if (commentCheck.rows.length === 0) {
        console.log('FAIL: Comment not found or inactive in database');
        return { status: 404, error: 'Comment not found' };
    }

    const comment = commentCheck.rows[0];

    // 2. Fetch User & E-Filing User identity mapping
    const userCheck = await client.query(`
        SELECT 
            u.id AS main_user_id, 
            u.role, 
            eu.id AS efiling_user_id
        FROM users u
        LEFT JOIN efiling_users eu ON eu.user_id = u.id
        WHERE u.id::text = $1::text
        
        UNION
        
        SELECT 
            u.id AS main_user_id, 
            u.role, 
            eu.id AS efiling_user_id
        FROM efiling_users eu
        JOIN users u ON u.id = eu.user_id
        WHERE eu.id::text = $1::text
    `, [String(requestUserId)]);

    console.log('2. User Check Rows:', userCheck.rows);

    if (!userCheck.rows.length) {
        console.log('FAIL: User not found for requestUserId:', requestUserId);
        return { status: 404, error: 'User not found' };
    }

    // Build complete set of valid IDs for this account across both tables
    const validUserIds = new Set([String(requestUserId)]);
    let currentUserRole = '';

    for (const row of userCheck.rows) {
        if (row.main_user_id !== null && row.main_user_id !== undefined) {
            validUserIds.add(String(row.main_user_id));
        }
        if (row.efiling_user_id !== null && row.efiling_user_id !== undefined) {
            validUserIds.add(String(row.efiling_user_id));
        }
        if (row.role !== null && row.role !== undefined && !currentUserRole) {
            currentUserRole = String(row.role).trim();
        }
    }

    console.log('Derived validUserIds Set:', Array.from(validUserIds));
    console.log('User Role:', currentUserRole);

    // Admin override
    const isSpecialRole = ['superadmin', 'CEO', 'Chief IT Officer'].includes(currentUserRole);
    if (isSpecialRole) {
        console.log('SUCCESS: Authorized via Special Admin Role');
        return { authorized: true };
    }

    // 3. Fetch file details
    const fileCheck = await client.query(`
        SELECT created_by, assigned_to FROM efiling_files WHERE id::text = $1::text
    `, [String(fileId)]);

    console.log('3. File Query Result:', fileCheck.rows);

    if (fileCheck.rows.length === 0) {
        console.log('FAIL: File not found');
        return { status: 404, error: 'File not found' };
    }

    const { created_by, assigned_to } = fileCheck.rows[0];

    // Ownership & state evaluation
    const isCommentOwner = validUserIds.has(String(comment.user_id));
    const isAssignedToUser = assigned_to !== null && assigned_to !== undefined && validUserIds.has(String(assigned_to));
    const isCreatorAtInitialState = (assigned_to === null || assigned_to === undefined) && validUserIds.has(String(created_by));
    const isFileUnderUser = isAssignedToUser || isCreatorAtInitialState;

    console.log('--- PERMISSION EVALUATION ---');
    console.log(`comment.user_id: "${comment.user_id}" | inside validUserIds? -> ${isCommentOwner}`);
    console.log(`file.assigned_to: "${assigned_to}" | inside validUserIds? -> ${isAssignedToUser}`);
    console.log(`file.created_by: "${created_by}" | (assigned_to is null & inside validUserIds)? -> ${isCreatorAtInitialState}`);
    console.log(`isFileUnderUser evaluation -> ${isFileUnderUser}`);

    if (!isCommentOwner || !isFileUnderUser) {
        console.log(`FAIL: Permission Denied (isCommentOwner: ${isCommentOwner}, isFileUnderUser: ${isFileUnderUser})`);
        return { status: 403, error: 'Unauthorized to modify this comment' };
    }

    console.log('SUCCESS: Authorized');
    return { authorized: true };
}

// PUT - Update comment
export async function PUT(request, { params }) {
    const { id: fileId, commentId } = await params;
    let client;

    try {
        const body = await request.json();
        const { text, user_id } = body;

        console.log('\n================================');
        console.log('PUT Request Received:');
        console.log('Params:', { fileId, commentId });
        console.log('Body:', { text, user_id });
        console.log('================================');

        if (!text || !user_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        client = await connectToDatabase();
        const auth = await verifyPermissions(client, fileId, commentId, user_id);

        if (!auth.authorized) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const result = await client.query(`
            UPDATE efiling_document_comments 
            SET text = $1, edited = TRUE, edited_at = CURRENT_TIMESTAMP
            WHERE id::text = $2::text AND file_id::text = $3::text
            RETURNING *
        `, [text, String(commentId), String(fileId)]);

        await logAction({
            user_id,
            file_id: fileId,
            action_type: 'EDIT_COMMENT',
            details: `Edited comment ${commentId}`,
            ip_address: request.headers.get('x-forwarded-for') || 'unknown'
        });

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating comment:', error);
        return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}

// DELETE - Soft delete comment
export async function DELETE(request, { params }) {
    const { id: fileId, commentId } = await params;
    let client;

    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        console.log('\n================================');
        console.log('DELETE Request Received:');
        console.log('Params:', { fileId, commentId });
        console.log('Query userId:', userId);
        console.log('================================');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        client = await connectToDatabase();
        const auth = await verifyPermissions(client, fileId, commentId, userId);

        if (!auth.authorized) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        await client.query(`
            UPDATE efiling_document_comments 
            SET is_active = FALSE
            WHERE id::text = $1::text AND file_id::text = $2::text
        `, [String(commentId), String(fileId)]);

        await logAction({
            user_id: userId,
            file_id: fileId,
            action_type: 'DELETE_COMMENT',
            details: `Deleted comment ${commentId}`,
            ip_address: request.headers.get('x-forwarded-for') || 'unknown'
        });

        return NextResponse.json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}