import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { query } from "@/lib/db";
import { logUserAction } from "@/lib/userActionLogger";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow CE users (role 7) to access this endpoint
    if (!session?.user || session.user.userType !== 'user' || parseInt(session.user.role) !== 7) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. CE access required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { approval_status, comments } = body;

    // Validate approval status
    if (!['approved', 'not_approved'].includes(approval_status)) {
      return NextResponse.json(
        { success: false, message: "Invalid approval status. Must be 'approved' or 'not_approved'." },
        { status: 400 }
      );
    }

    // Check if CE user has access to this request's department
    const ceUserQuery = await query(`
      SELECT 
        cu.id as ce_user_id,
        cu.user_id,
        array_agg(cud.complaint_type_id) as department_ids
      FROM ce_users cu
      LEFT JOIN ce_user_departments cud ON cu.id = cud.ce_user_id
      WHERE cu.user_id = $1
      GROUP BY cu.id, cu.user_id
    `, [session.user.id]);

    if (ceUserQuery.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "CE user not found or no departments assigned." },
        { status: 404 }
      );
    }

    const ceUser = ceUserQuery.rows[0];
    const departmentIds = ceUser.department_ids.filter(id => id !== null);

    // Get the work request to check if CE has access to its department
    const workRequestQuery = await query(`
      SELECT complaint_type_id FROM work_requests WHERE id = $1
    `, [id]);

    if (workRequestQuery.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Work request not found." },
        { status: 404 }
      );
    }

    const workRequest = workRequestQuery.rows[0];
    
    if (!departmentIds.includes(workRequest.complaint_type_id)) {
      return NextResponse.json(
        { success: false, message: "You don't have permission to approve this request. It's not in your assigned departments." },
        { status: 403 }
      );
    }

    // Check if CE approval already exists
    const existingApproval = await query(`
      SELECT id FROM work_request_soft_approvals 
      WHERE work_request_id = $1 AND approver_type = 'ce'
    `, [id]);

    let result;
    if (existingApproval.rows.length > 0) {
      // Update existing approval
      result = await query(`
        UPDATE work_request_soft_approvals 
        SET 
          approval_status = $1,
          comments = $2,
          approved_at = CASE WHEN $1 = 'approved' THEN CURRENT_TIMESTAMP ELSE NULL END,
          updated_at = CURRENT_TIMESTAMP
        WHERE work_request_id = $3 AND approver_type = 'ce'
        RETURNING *
      `, [approval_status, comments, id]);
    } else {
      // Create new approval
      result = await query(`
        INSERT INTO work_request_soft_approvals (
          work_request_id,
          approver_id,
          approver_type,
          approval_status,
          comments,
          approved_at,
          created_at,
          updated_at
        ) VALUES ($1, $2, 'ce', $3, $4, CASE WHEN $3 = 'approved' THEN CURRENT_TIMESTAMP ELSE NULL END, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `, [id, session.user.id, approval_status, comments]);
    }

    // Log the approval action
    await logUserAction({
      user_id: session.user.id,
      user_type: 'ce',
      user_role: 7,
      user_name: session.user.name || 'CE',
      user_email: session.user.email,
      action_type: approval_status === 'approved' ? 'APPROVE_REQUEST' : 'REJECT_REQUEST',
      entity_type: 'WORK_REQUEST',
      entity_id: parseInt(id),
      details: `CE ${approval_status} work request #${id}. Comments: ${comments || 'None'}`,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: `Work request ${approval_status} successfully`,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error in CE approval API:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}