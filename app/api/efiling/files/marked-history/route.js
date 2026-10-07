// File: src/app/api/efiling/files/marked-history/route.js
//
// Returns every marking (action_type = 'MARK_TO') of a file to the logged-in user, including files
// that are no longer currently assigned to them.
// One row per marking: if a file was marked to the user several times (possibly by different
// users), each marking is returned as its own row with its own Marked By / Marked On.
// Names are resolved via efiling_users -> users (from_user_name / to_user_name are not populated).

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

const NO_STORE_HEADERS = {
    'Cache-Control': 'private, no-store, no-cache, must-revalidate',
    Pragma: 'no-cache',
};

function json(data, status = 200) {
    return NextResponse.json(data, { status, headers: NO_STORE_HEADERS });
}

export async function GET() {
    let client;
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return json({ error: 'Unauthorized' }, 401);
        }

        client = await connectToDatabase();
        if (!client) {
            return json({ error: 'Database unavailable' }, 503);
        }

        // Resolve the logged-in user's efiling_users.id (same approach as my-actions)
        const userRes = await client.query(
            `SELECT eu.id FROM efiling_users eu WHERE eu.user_id = $1 AND eu.is_active = true LIMIT 1`,
            [session.user.id]
        );
        const efilingUserId = userRes.rows[0]?.id || null;
        if (!efilingUserId) {
            return json({ files: [] });
        }

        const result = await client.query(
            `
            SELECT
                m.id AS movement_id,
                f.id,
                f.file_number,
                f.subject,
                f.department_id,
                f.file_type_id,
                f.created_at,
                c.budget_head_no AS budget_head,
                c.proposed_estimated_cost,
                d.name   AS department_name,
                ft.name  AS file_type_name,
                st.name  AS status_name,
                cu.name  AS creator_user_name,
                au.name  AS current_assignee_user_name,
                bu.name  AS marked_by_name,
                m.created_at AS marked_on
            FROM efiling_file_movements m
            JOIN efiling_files f                 ON f.id = m.file_id
            LEFT JOIN efiling_files_costing c    ON c.file_id = f.id
            LEFT JOIN efiling_departments d      ON d.id = f.department_id
            LEFT JOIN efiling_file_types ft      ON ft.id = f.file_type_id
            LEFT JOIN efiling_file_status st     ON st.id = f.status_id
            LEFT JOIN efiling_users ceu          ON ceu.id = f.created_by
            LEFT JOIN users cu                   ON cu.id = ceu.user_id
            LEFT JOIN efiling_users aeu          ON aeu.id = f.assigned_to
            LEFT JOIN users au                   ON au.id = aeu.user_id
            LEFT JOIN efiling_users beu          ON beu.id = m.from_user_id
            LEFT JOIN users bu                   ON bu.id = beu.user_id
            WHERE m.to_user_id = $1
              AND m.action_type = 'MARK_TO'
            ORDER BY m.created_at DESC, m.id DESC
            `,
            [efilingUserId]
        );

        return json({ files: result.rows });
    } catch (error) {
        console.error('Error fetching marked-to-me history:', error);
        return json({ error: 'Failed to fetch marked files history' }, 500);
    } finally {
        if (client && typeof client.release === 'function') {
            try {
                client.release();
            } catch (releaseError) {
                console.error('Error releasing database client:', releaseError);
            }
        }
    }
}