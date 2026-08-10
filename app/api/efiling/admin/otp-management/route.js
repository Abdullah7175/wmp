import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import { logAction } from '@/lib/actionLogger';

function isAdminRole(session) {
    return session?.user?.role != null && parseInt(session.user.role, 10) === 1;
}

export async function GET(request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        if (!isAdminRole(session)) {
            return NextResponse.json(
                { error: 'Only e-filing admin (role 1) can access OTP management' },
                { status: 403 }
            );
        }

        const sql = `
            SELECT 
                o.id,
                o.user_id,
                o.otp_code,
                o.method,
                o.expires_at,
                o.created_at,
                o.verified,
                u.name AS user_name,
                u.email AS user_email
            FROM efiling_otp_codes o
            LEFT JOIN efiling_users eu ON o.user_id::text = eu.id::text
            LEFT JOIN users u ON eu.user_id::text = u.id::text
            ORDER BY o.created_at DESC
        `;

        const result = await query(sql);

        return NextResponse.json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error('[otp-management-get]', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        if (!isAdminRole(session)) {
            return NextResponse.json(
                { error: 'Only e-filing admin (role 1) can reset OTP attempts' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'userId parameter is required' },
                { status: 400 }
            );
        }

        const deleteSql = `
            DELETE FROM efiling_otp_codes 
            WHERE user_id = $1
        `;
        const result = await query(deleteSql, [userId]);

        await logAction(request, 'DELETE', 'otp_reset', {
            details: {
                target_user_id: userId,
                deleted_rows: result.rowCount,
            },
        }).catch(() => {});

        return NextResponse.json({
            success: true,
            message: `Cleared all ${result.rowCount} OTP entries across all methods for user ${userId}.`,
        });
    } catch (error) {
        console.error('[otp-management-delete]', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}