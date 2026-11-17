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
        const { comment, tso_flag } = await request.json();

        client = await connectToDatabase();

        // Verify user role is TSO or CSO (or legacy role id 4)
        const userCheck = await client.query(`
            SELECT r.code as role_code, r.name as role_name
            FROM efiling_users u 
            JOIN efiling_roles r ON u.efiling_role_id = r.id 
            WHERE u.user_id = $1
        `, [session.user.id]);

        const roleCode = (userCheck.rows[0]?.role_code || '').toString().toUpperCase();
        const roleName = (userCheck.rows[0]?.role_name || '').toString().toUpperCase();
        const isAllowed =
            roleCode === 'TSO_CEO_SEC' ||
            roleCode === 'CSO' ||
            roleName === 'CSO' ||
            roleName.includes('CSO') ||
            String(session.user.role) === '4';

        if (!isAllowed) {
            return NextResponse.json({ error: 'Forbidden: Only TSO/CSO can add CEO recommendation comments' }, { status: 403 });
        }
 
        const result = await client.query(`
            UPDATE efiling_files 
            SET tso_recommendation_comment = $1, 
                tso_flag = $2,
                tso_recommendation_timestamp = NOW(),
                updated_at = NOW() 
            WHERE id = $3 
            RETURNING tso_recommendation_comment, tso_flag, tso_recommendation_timestamp
        `, [comment, !!tso_flag, id]);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'File not found or update failed' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            comment: result.rows[0]?.tso_recommendation_comment,
            tso_flag: result.rows[0]?.tso_flag,
            timestamp: result.rows[0]?.tso_recommendation_timestamp
        });

    } catch (error) {
        console.error('Error saving TSO comment:', error);
        return NextResponse.json({ error: 'Failed to save comment' }, { status: 500 });
    } finally {
        if (client) await client.release();
    }
}