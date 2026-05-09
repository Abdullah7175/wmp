import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    let client;
    try {
        const session = await auth();
        
        // RBAC: Strict check for CEO role (Role ID: 5)
        // Adjust the ID if your CEO role ID is different in the efiling_roles table
        if (!session || parseInt(session.user.role) !== 5) {
            return NextResponse.json({ error: 'Unauthorized: CEO access only' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const fiscalYear = searchParams.get('fiscalYear') || '2025-26';

        client = await connectToDatabase();

        // Query to get total and status breakdown filtered by Fiscal Year
        // We use split_part to get the middle section of "WA_EM/2025-26/0001"
        const statsQuery = await client.query(`
            SELECT 
                COUNT(*) as total_files,
                COUNT(CASE WHEN s.code = 'DRAFT' THEN 1 END) as draft,
                COUNT(CASE WHEN s.code = 'PENDING' OR s.code = 'PENDING_APPROVAL' THEN 1 END) as pending,
                COUNT(CASE WHEN s.code = 'IN_PROGRESS' THEN 1 END) as in_progress,
                COUNT(CASE WHEN s.code = 'APPROVED' THEN 1 END) as approved,
                COUNT(CASE WHEN s.code = 'REJECTED' THEN 1 END) as rejected,
                COUNT(CASE WHEN s.code = 'COMPLETED' THEN 1 END) as completed,
                COUNT(CASE WHEN f.sla_breached = true THEN 1 END) as overdue
            FROM efiling_files f
            LEFT JOIN efiling_file_status s ON f.status_id = s.id
            WHERE split_part(f.file_number, '/', 2) = $1
        `, [fiscalYear]);

        return NextResponse.json({
            success: true,
            data: statsQuery.rows[0]
        });

    } catch (error) {
        console.error('CEO Stats Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}