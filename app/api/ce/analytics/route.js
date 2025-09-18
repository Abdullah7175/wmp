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

    // Get total requests for CE's department
    const totalRequestsResult = await client.query(`
      SELECT COUNT(*) as count
      FROM requests r
      LEFT JOIN complaint_types ct ON r.complaint_type_id = ct.id
      WHERE 1=1 ${departmentFilter}
    `);

    // Get pending CE approval
    const pendingCeApprovalResult = await client.query(`
      SELECT COUNT(*) as count
      FROM requests r
      LEFT JOIN complaint_types ct ON r.complaint_type_id = ct.id
      LEFT JOIN work_request_soft_approvals ce_approval ON r.id = ce_approval.work_request_id AND ce_approval.approver_type = 'ce'
      WHERE (ce_approval.approval_status IS NULL OR ce_approval.approval_status = 'pending')
      ${departmentFilter}
    `);

    // Get CE approved
    const ceApprovedResult = await client.query(`
      SELECT COUNT(*) as count
      FROM requests r
      LEFT JOIN complaint_types ct ON r.complaint_type_id = ct.id
      LEFT JOIN work_request_soft_approvals ce_approval ON r.id = ce_approval.work_request_id AND ce_approval.approver_type = 'ce'
      WHERE ce_approval.approval_status = 'approved'
      ${departmentFilter}
    `);

    // Get CE rejected
    const ceRejectedResult = await client.query(`
      SELECT COUNT(*) as count
      FROM requests r
      LEFT JOIN complaint_types ct ON r.complaint_type_id = ct.id
      LEFT JOIN work_request_soft_approvals ce_approval ON r.id = ce_approval.work_request_id AND ce_approval.approver_type = 'ce'
      WHERE ce_approval.approval_status = 'rejected'
      ${departmentFilter}
    `);

    // Get department-wise breakdown
    const waterRequestsResult = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN (ce_approval.approval_status IS NULL OR ce_approval.approval_status = 'pending') THEN 1 END) as pending,
        COUNT(CASE WHEN ce_approval.approval_status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN ce_approval.approval_status = 'rejected' THEN 1 END) as rejected
      FROM requests r
      LEFT JOIN complaint_types ct ON r.complaint_type_id = ct.id
      LEFT JOIN work_request_soft_approvals ce_approval ON r.id = ce_approval.work_request_id AND ce_approval.approver_type = 'ce'
      WHERE LOWER(ct.type_name) LIKE '%water%'
    `);

    const sewerageRequestsResult = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN (ce_approval.approval_status IS NULL OR ce_approval.approval_status = 'pending') THEN 1 END) as pending,
        COUNT(CASE WHEN ce_approval.approval_status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN ce_approval.approval_status = 'rejected' THEN 1 END) as rejected
      FROM requests r
      LEFT JOIN complaint_types ct ON r.complaint_type_id = ct.id
      LEFT JOIN work_request_soft_approvals ce_approval ON r.id = ce_approval.work_request_id AND ce_approval.approver_type = 'ce'
      WHERE LOWER(ct.type_name) LIKE '%sewerage%'
    `);

    // Get recent CE activities
    const recentActivitiesResult = await client.query(`
      SELECT 
        r.id as request_id,
        ce_approval.approval_status,
        ce_approval.comments,
        ce_approval.approved_at,
        r.address,
        u.name as ce_name
      FROM requests r
      LEFT JOIN work_request_soft_approvals ce_approval ON r.id = ce_approval.work_request_id AND ce_approval.approver_type = 'ce'
      LEFT JOIN users u ON ce_approval.approver_id = u.id
      LEFT JOIN complaint_types ct ON r.complaint_type_id = ct.id
      WHERE ce_approval.approval_status IS NOT NULL
      ${departmentFilter}
      ORDER BY ce_approval.approved_at DESC
      LIMIT 10
    `);

    const analytics = {
      totalRequests: parseInt(totalRequestsResult.rows[0].count),
      pendingCeApproval: parseInt(pendingCeApprovalResult.rows[0].count),
      ceApproved: parseInt(ceApprovedResult.rows[0].count),
      ceRejected: parseInt(ceRejectedResult.rows[0].count),
      waterRequests: parseInt(waterRequestsResult.rows[0].total),
      waterPending: parseInt(waterRequestsResult.rows[0].pending),
      waterApproved: parseInt(waterRequestsResult.rows[0].approved),
      waterRejected: parseInt(waterRequestsResult.rows[0].rejected),
      sewerageRequests: parseInt(sewerageRequestsResult.rows[0].total),
      seweragePending: parseInt(sewerageRequestsResult.rows[0].pending),
      sewerageApproved: parseInt(sewerageRequestsResult.rows[0].approved),
      sewerageRejected: parseInt(sewerageRequestsResult.rows[0].rejected),
      recentActivities: recentActivitiesResult.rows.map(activity => ({
        requestId: activity.request_id,
        type: activity.approval_status,
        description: `Request #${activity.request_id} ${activity.approval_status} by ${activity.ce_name || 'CE'}`,
        timestamp: activity.approved_at ? new Date(activity.approved_at).toLocaleString() : 'N/A'
      })),
      ceUser: {
        name: ceUser.name,
        department: ceUser.department,
        designation: ceUser.designation
      }
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Error fetching CE analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
