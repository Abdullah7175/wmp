import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { connectToDatabase } from "@/lib/db";

export async function POST(request, { params }) {
  let client;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || parseInt(session.user.role) !== 7 || session.user.userType !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status, comment } = await request.json();

    if (!status || !comment) {
      return NextResponse.json({ error: 'Status and comment are required' }, { status: 400 });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
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

    // Check if request exists and CE has access
    const requestResult = await client.query(`
      SELECT 
        r.*,
        ct.type_name as complaint_type
      FROM requests r
      LEFT JOIN complaint_types ct ON r.complaint_type_id = ct.id
      WHERE r.id = $1
    `, [id]);

    if (requestResult.rows.length === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const request = requestResult.rows[0];
    const ceDepartment = ceUser.department?.toLowerCase();
    const requestType = request.complaint_type?.toLowerCase();

    // Check department access
    if (ceDepartment === 'water' && !requestType?.includes('water')) {
      return NextResponse.json({ error: 'Access denied - Water CE can only approve water-related requests' }, { status: 403 });
    }
    if (ceDepartment === 'sewerage' && !requestType?.includes('sewerage')) {
      return NextResponse.json({ error: 'Access denied - Sewerage CE can only approve sewerage-related requests' }, { status: 403 });
    }

    // Insert or update CE soft approval using the same mechanism as CEO/COO
    const upsertQuery = `
      INSERT INTO work_request_soft_approvals (work_request_id, approver_id, approver_type, approval_status, comments, approved_at, created_at, updated_at)
      VALUES ($1, $2, 'ce', $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (work_request_id, approver_type) 
      DO UPDATE SET 
        approval_status = $3,
        comments = $4,
        approved_at = $5,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const approvedAt = status === 'pending' ? null : new Date().toISOString();
    
    const approvalResult = await client.query(upsertQuery, [
      id,
      session.user.id,
      status,
      comment,
      approvedAt
    ]);

    if (approvalResult.rows.length === 0) {
      return NextResponse.json({ error: 'Failed to update CE approval' }, { status: 500 });
    }

    // Log the action
    await client.query(`
      INSERT INTO user_actions (
        user_id, user_type, user_role, user_name, user_email,
        action_type, entity_type, entity_id, entity_name, details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      session.user.id,
      'user',
      7,
      ceUser.name,
      ceUser.email,
      'CE_APPROVAL',
      'request',
      id,
      `Request #${id}`,
      JSON.stringify({
        status: status,
        comment: comment,
        ce_department: ceUser.department
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      message: `Request ${status} successfully`,
      approval: approvalResult.rows[0]
    });

  } catch (error) {
    console.error('Error updating CE approval:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
