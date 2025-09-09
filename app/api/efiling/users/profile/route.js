import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

// Get e-filing user profile by users.id
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const client = await connectToDatabase();

        try {
            // Get user data with joins to get related information
            const userResult = await client.query(
                `SELECT 
                    u.id,
                    u.name,
                    u.email,
                    u.contact_number,
                    u.created_date,
                    u.updated_date,
                    u.role,
                    eu.id as efiling_user_id,
                    eu.employee_id,
                    eu.designation,
                    eu.address,
                    eu.department_id,
                    eu.efiling_role_id,
                    eu.supervisor_id,
                    eu.approval_level,
                    eu.approval_amount_limit,
                    eu.can_sign,
                    eu.can_create_files,
                    eu.can_approve_files,
                    eu.can_reject_files,
                    eu.can_transfer_files,
                    eu.max_concurrent_files,
                    eu.preferred_signature_method,
                    eu.signature_settings,
                    eu.notification_preferences,
                    eu.is_active,
                    eu.created_at,
                    eu.updated_at,
                    eu.google_email,
                    d.name as department_name,
                    r.name as role_name
                FROM users u
                LEFT JOIN efiling_users eu ON u.id = eu.user_id
                LEFT JOIN efiling_departments d ON eu.department_id = d.id
                LEFT JOIN efiling_roles r ON eu.efiling_role_id = r.id
                WHERE u.id = $1`,
                [userId]
            );

            if (userResult.rows.length === 0) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            const user = userResult.rows[0];

            // Parse JSON fields
            if (user.signature_settings) {
                try {
                    user.signature_settings = JSON.parse(user.signature_settings);
                } catch (e) {
                    user.signature_settings = {};
                }
            }

            if (user.notification_preferences) {
                try {
                    user.notification_preferences = JSON.parse(user.notification_preferences);
                } catch (e) {
                    user.notification_preferences = {};
                }
            }

            return NextResponse.json(user);

        } finally {
            await client.release();
        }

    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user profile', details: error.message },
            { status: 500 }
        );
    }
}
