import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { connectToDatabase } from "@/lib/db";

export async function GET(request) {
  let client;
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow CE users (role 7) to access this endpoint
    if (!session?.user || session.user.userType !== 'user' || parseInt(session.user.role) !== 7) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. CE access required." },
        { status: 401 }
      );
    }

    client = await connectToDatabase();

    // Get CE user departments (complaint types)
    const ceUserQuery = await client.query(`
      SELECT 
        cu.id as ce_user_id,
        cu.user_id,
        cu.designation,
        cu.address,
        array_agg(cud.complaint_type_id) as department_ids
      FROM ce_users cu
      LEFT JOIN ce_user_departments cud ON cu.id = cud.ce_user_id
      WHERE cu.user_id = $1
      GROUP BY cu.id, cu.user_id, cu.designation, cu.address
    `, [session.user.id]);

    if (ceUserQuery.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "CE user not found or no departments assigned." },
        { status: 404 }
      );
    }

    const ceUser = ceUserQuery.rows[0];
    const departmentIds = ceUser.department_ids.filter(id => id !== null);

    if (departmentIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          totalRequests: 0,
          pendingApprovals: 0,
          approvedToday: 0,
          rejectedToday: 0,
          ceUser: {
            id: ceUser.ce_user_id,
            designation: ceUser.designation,
            departments: []
          },
          departmentStats: []
        }
      });
    }

    // Get department names
    const departmentNamesQuery = await client.query(`
      SELECT id, type_name FROM complaint_types WHERE id = ANY($1)
    `, [departmentIds]);

    const departmentNames = departmentNamesQuery.rows.reduce((acc, dept) => {
      acc[dept.id] = dept.type_name;
      return acc;
    }, {});

    // Build the WHERE clause for department filtering
    const departmentPlaceholders = departmentIds.map((_, index) => `$${index + 1}`).join(',');

    // Get total requests count
    const totalRequestsQuery = await client.query(`
      SELECT COUNT(*) as count
      FROM work_requests wr
      WHERE wr.complaint_type_id IN (${departmentPlaceholders})
    `, departmentIds);

    // Get pending approvals count
    const pendingApprovalsQuery = await client.query(`
      SELECT COUNT(*) as count
      FROM work_requests wr
      LEFT JOIN work_request_soft_approvals ce_approval ON wr.id = ce_approval.work_request_id AND ce_approval.approver_type = 'ce'
      WHERE wr.complaint_type_id IN (${departmentPlaceholders})
      AND (ce_approval.approval_status IS NULL OR ce_approval.approval_status = 'pending')
    `, departmentIds);

    // Get approved today count
    const approvedTodayQuery = await client.query(`
      SELECT COUNT(*) as count
      FROM work_requests wr
      LEFT JOIN work_request_soft_approvals ce_approval ON wr.id = ce_approval.work_request_id AND ce_approval.approver_type = 'ce'
      WHERE wr.complaint_type_id IN (${departmentPlaceholders})
      AND ce_approval.approval_status = 'approved'
      AND DATE(ce_approval.approved_at) = CURRENT_DATE
    `, departmentIds);

    // Get rejected today count
    const rejectedTodayQuery = await client.query(`
      SELECT COUNT(*) as count
      FROM work_requests wr
      LEFT JOIN work_request_soft_approvals ce_approval ON wr.id = ce_approval.work_request_id AND ce_approval.approver_type = 'ce'
      WHERE wr.complaint_type_id IN (${departmentPlaceholders})
      AND ce_approval.approval_status = 'not_approved'
      AND DATE(ce_approval.approved_at) = CURRENT_DATE
    `, departmentIds);

    // Get department-wise statistics
    const departmentStatsQuery = await client.query(`
      SELECT 
        wr.complaint_type_id,
        ct.type_name as department_name,
        COUNT(*) as total,
        COUNT(CASE WHEN ce_approval.approval_status IS NULL OR ce_approval.approval_status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN ce_approval.approval_status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN ce_approval.approval_status = 'not_approved' THEN 1 END) as rejected
      FROM work_requests wr
      LEFT JOIN complaint_types ct ON wr.complaint_type_id = ct.id
      LEFT JOIN work_request_soft_approvals ce_approval ON wr.id = ce_approval.work_request_id AND ce_approval.approver_type = 'ce'
      WHERE wr.complaint_type_id IN (${departmentPlaceholders})
      GROUP BY wr.complaint_type_id, ct.type_name
      ORDER BY ct.type_name
    `, departmentIds);

    return NextResponse.json({
      success: true,
      data: {
        totalRequests: parseInt(totalRequestsQuery.rows[0].count),
        pendingApprovals: parseInt(pendingApprovalsQuery.rows[0].count),
        approvedToday: parseInt(approvedTodayQuery.rows[0].count),
        rejectedToday: parseInt(rejectedTodayQuery.rows[0].count),
        ceUser: {
          id: ceUser.ce_user_id,
          designation: ceUser.designation,
          departments: departmentIds.map(id => ({
            id: id,
            type_name: departmentNames[id]
          }))
        },
        departmentStats: departmentStatsQuery.rows.map(row => ({
          department_id: row.complaint_type_id,
          department_name: row.department_name,
          total: parseInt(row.total),
          pending: parseInt(row.pending),
          approved: parseInt(row.approved),
          rejected: parseInt(row.rejected)
        }))
      }
    });

  } catch (error) {
    console.error('Error in CE dashboard API:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (client && client.release) {
      client.release();
    }
  }
}
