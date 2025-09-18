import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { connectToDatabase } from "@/lib/db";

export async function GET() {
  let client;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || parseInt(session.user.role) !== 7 || session.user.userType !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    client = await connectToDatabase();

    // Get CE user info to determine department
    const ceUserResult = await client.query(`
      SELECT u.*, cu.department_id, cu.designation, cu.department
      FROM users u
      LEFT JOIN ce_users cu ON u.id = cu.user_id
      WHERE u.id = $1
    `, [session.user.id]);

    if (ceUserResult.rows.length === 0) {
      return NextResponse.json({ error: 'CE user not found' }, { status: 404 });
    }

    const ceUser = ceUserResult.rows[0];
    const ceDepartment = ceUser.department?.toLowerCase();

    // Build department filter
    let departmentFilter = '';
    if (ceDepartment === 'water') {
      departmentFilter = "AND LOWER(ct.type_name) LIKE '%water%'";
    } else if (ceDepartment === 'sewerage') {
      departmentFilter = "AND LOWER(ct.type_name) LIKE '%sewerage%'";
    }

    // Fetch requests with before content count and CE approval status
    const result = await client.query(`
      SELECT 
        r.*,
        ct.type_name as complaint_type,
        s.name as status_name,
        d.title as district_name,
        COUNT(bc.id) as before_content_count,
        ce_approval.approval_status as ce_approval_status,
        ce_approval.comments as ce_comments
      FROM requests r
      LEFT JOIN complaint_types ct ON r.complaint_type_id = ct.id
      LEFT JOIN status s ON r.status_id = s.id
      LEFT JOIN district d ON r.district_id = d.id
      LEFT JOIN before_content bc ON r.id = bc.work_request_id
      LEFT JOIN work_request_soft_approvals ce_approval ON r.id = ce_approval.work_request_id AND ce_approval.approver_type = 'ce'
      WHERE 1=1 ${departmentFilter}
      GROUP BY r.id, ct.type_name, s.name, d.title, ce_approval.approval_status, ce_approval.comments
      ORDER BY r.request_date DESC
    `);

    return NextResponse.json(result.rows);

  } catch (error) {
    console.error('Error fetching CE requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
