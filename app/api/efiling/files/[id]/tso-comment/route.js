import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { auth } from '@/auth';

export async function PUT(request, context) {
    let client;
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Next.js 15 requirement: params must be awaited
        const params = await context.params;
        const { id } = params;
        const { comment } = await request.json();

        client = await connectToDatabase();

        // Verify user role code is TSO (or check user ID against session)
        const userCheck = await client.query(`
            SELECT r.code as role_code 
            FROM efiling_users u 
            JOIN efiling_roles r ON u.efiling_role_id = r.id 
            WHERE u.user_id = $1
        `, [session.user.id]);

        const roleCode = userCheck.rows[0]?.role_code?.toUpperCase();

        if (roleCode !== 'TSO_CEO_SEC' && String(session.user.role) !== '4') {
            return NextResponse.json({ error: 'Forbidden: Only TSO can add CEO recommendation comments' }, { status: 403 });
        }

        // Update tso_recommendation_comment AND tso_recommendation_timestamp in database
        const result = await client.query(`
            UPDATE efiling_files 
            SET tso_recommendation_comment = $1, 
                tso_recommendation_timestamp = NOW(),
                updated_at = NOW() 
            WHERE id = $2 
            RETURNING tso_recommendation_comment, tso_recommendation_timestamp
        `, [comment, id]);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'File not found or update failed' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            comment: result.rows[0]?.tso_recommendation_comment,
            timestamp: result.rows[0]?.tso_recommendation_timestamp
        });

    } catch (error) {
        console.error('Error saving TSO comment:', error);
        return NextResponse.json({ error: 'Failed to save comment' }, { status: 500 });
    } finally {
        if (client) await client.release();
    }
}