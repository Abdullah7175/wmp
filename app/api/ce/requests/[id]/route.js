import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { connectToDatabase } from "@/lib/db";

export async function GET(request, { params }) {
  let client;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || parseInt(session.user.role) !== 7 || session.user.userType !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
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

    // Fetch request with before content and CE approval status
    const result = await client.query(`
      SELECT 
        r.*,
        ct.type_name as complaint_type,
        s.name as status_name,
        d.title as district_name,
        ce_approval.approval_status as ce_approval_status,
        ce_approval.comments as ce_comments
      FROM requests r
      LEFT JOIN complaint_types ct ON r.complaint_type_id = ct.id
      LEFT JOIN status s ON r.status_id = s.id
      LEFT JOIN district d ON r.district_id = d.id
      LEFT JOIN work_request_soft_approvals ce_approval ON r.id = ce_approval.work_request_id AND ce_approval.approver_type = 'ce'
      WHERE r.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const request = result.rows[0];

    // Check if CE has access to this request based on department
    const requestType = request.complaint_type?.toLowerCase();
    if (ceDepartment === 'water' && !requestType?.includes('water')) {
      return NextResponse.json({ error: 'Access denied - Water CE can only access water-related requests' }, { status: 403 });
    }
    if (ceDepartment === 'sewerage' && !requestType?.includes('sewerage')) {
      return NextResponse.json({ error: 'Access denied - Sewerage CE can only access sewerage-related requests' }, { status: 403 });
    }

    // Fetch before content
    const beforeContentResult = await client.query(`
      SELECT 
        bc.*,
        u.name as creator_name
      FROM before_content bc
      LEFT JOIN users u ON bc.created_by = u.id
      WHERE bc.work_request_id = $1
      ORDER BY bc.created_at DESC
    `, [id]);

    request.beforeContent = beforeContentResult.rows;

    return NextResponse.json(request);

  } catch (error) {
    console.error('Error fetching CE request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
