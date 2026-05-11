import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    let client;
    try {
        const session = await auth();
        // Assuming role 5 is CEO as per your snippet
        if (!session || parseInt(session.user.role) !== 5) {
            return NextResponse.json({ error: 'Unauthorized: CEO access only' }, { status: 403 });
        }
        const { searchParams } = new URL(request.url);
        const fiscalYear = searchParams.get('fiscalYear') || '2025-26';

        client = await connectToDatabase();

        const statsQuery = await client.query(` 
            SELECT 
                COUNT(*) as total_files,
                COUNT(CASE WHEN f.work_request_id IS NOT NULL THEN 1 END) as total_work_related,
                
                COUNT(CASE WHEN s.code = 'DRAFT' THEN 1 END) as draft,
                COUNT(CASE WHEN s.code = 'DRAFT' AND f.work_request_id IS NOT NULL THEN 1 END) as draft_work_related,

                COUNT(CASE WHEN s.code IN ('PENDING', 'PENDING_APPROVAL') THEN 1 END) as pending,
                COUNT(CASE WHEN s.code IN ('PENDING', 'PENDING_APPROVAL') AND f.work_request_id IS NOT NULL THEN 1 END) as pending_work_related,

                COUNT(CASE WHEN s.code = 'IN_PROGRESS' THEN 1 END) as in_progress,
                COUNT(CASE WHEN s.code = 'IN_PROGRESS' AND f.work_request_id IS NOT NULL THEN 1 END) as in_progress_work_related,

                COUNT(CASE WHEN s.code = 'APPROVED' THEN 1 END) as approved,
                COUNT(CASE WHEN s.code = 'APPROVED' AND f.work_request_id IS NOT NULL THEN 1 END) as approved_work_related,

                COUNT(CASE WHEN s.code = 'REJECTED' THEN 1 END) as rejected,
                COUNT(CASE WHEN s.code = 'REJECTED' AND f.work_request_id IS NOT NULL THEN 1 END) as rejected_work_related,

                COUNT(CASE WHEN s.code = 'COMPLETED' THEN 1 END) as completed,
                COUNT(CASE WHEN s.code = 'COMPLETED' AND f.work_request_id IS NOT NULL THEN 1 END) as completed_work_related,

                COUNT(CASE WHEN f.sla_breached = true THEN 1 END) as overdue,
                COUNT(CASE WHEN f.sla_breached = true AND f.work_request_id IS NOT NULL THEN 1 END) as overdue_work_related
            FROM efiling_files f
            LEFT JOIN efiling_file_status s ON f.status_id = s.id
            WHERE split_part(f.file_number, '/', 2) = $1
        `, [fiscalYear]);

        const filesQuery = await client.query(`
            SELECT 
                f.file_number, 
                f.subject, 
                c.name as category, 
                d.name as department, 
                s.name as status, 
                f.work_request_id, 
                u_creator.name as created_by_name,
                ft.name as file_type,
                u_assignee.name as assigned_to_name,
                f.sla_breached,
                f.created_at,
                EXTRACT(DAY FROM (CURRENT_TIMESTAMP - f.created_at)) as aging
            FROM efiling_files f
            LEFT JOIN efiling_file_categories c ON f.category_id = c.id
            LEFT JOIN efiling_departments d ON f.department_id = d.id
            LEFT JOIN efiling_file_status s ON f.status_id = s.id
            LEFT JOIN efiling_file_types ft ON f.file_type_id = ft.id
            -- Join to get Creator Name
            LEFT JOIN efiling_users eu_creator ON f.created_by = eu_creator.id
            LEFT JOIN users u_creator ON eu_creator.user_id = u_creator.id
            -- Join to get Assignee Name
            LEFT JOIN efiling_users eu_assignee ON f.assigned_to = eu_assignee.id
            LEFT JOIN users u_assignee ON eu_assignee.user_id = u_assignee.id
            WHERE split_part(f.file_number, '/', 2) = $1
            ORDER BY f.created_at DESC
        `, [fiscalYear]);

        const categoryAnalyticsQuery = await client.query(`
            SELECT 
                c.id,
                c.name as category_name,
                COUNT(f.id) as total_files,
                SUM(COALESCE(fc.proposed_estimated_cost, 0)) as total_estimated_cost,
                -- Aggregate statuses into a JSON object for the frontend
                jsonb_object_agg(
                    COALESCE(s.name, 'Unknown'), 
                    (SELECT COUNT(*) FROM efiling_files f2 WHERE f2.category_id = c.id AND f2.status_id = s.id)
                ) as status_distribution,
                ROUND(AVG(EXTRACT(DAY FROM (CURRENT_TIMESTAMP - f.created_at)))::numeric, 1) as avg_aging
            FROM efiling_file_categories c
            LEFT JOIN efiling_files f ON c.id = f.category_id AND split_part(f.file_number, '/', 2) = $1
            LEFT JOIN efiling_files_costing fc ON f.id = fc.file_id
            LEFT JOIN efiling_file_status s ON f.status_id = s.id
            GROUP BY c.id, c.name
            ORDER BY total_estimated_cost DESC
        `, [fiscalYear]);

        return NextResponse.json({
            success: true,
            data: {
                stats: statsQuery.rows[0],
                files: filesQuery.rows,
                categoryAnalytics: categoryAnalyticsQuery.rows 
            }
        });

    } catch (error) {
        console.error('CEO Stats Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}