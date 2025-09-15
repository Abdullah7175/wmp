import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { query } from "@/lib/db";
import { logUserAction } from "@/lib/userActionLogger";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow CEO users (role 5) to access this endpoint
    if (!session?.user || session.user.userType !== 'user' || parseInt(session.user.role) !== 5) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. CEO access required." },
        { status: 401 }
      );
    }

    // Log CEO analytics access
    await logUserAction({
      user_id: session.user.id,
      user_type: 'ceo',
      user_role: 5,
      user_name: session.user.name || 'CEO',
      user_email: session.user.email,
      action_type: 'VIEW_ANALYTICS',
      entity_type: 'ANALYTICS_DASHBOARD',
      entity_id: null,
      details: 'CEO accessed comprehensive analytics dashboard',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    // Get total requests count
    const totalRequests = await query(`
      SELECT COUNT(*) as count FROM work_requests
    `);

    // Get active requests count (in progress)
    const activeRequests = await query(`
      SELECT COUNT(*) as count 
      FROM work_requests wr
      LEFT JOIN status s ON wr.status_id = s.id
      WHERE s.name IN ('In Progress', 'Active', 'Ongoing')
    `);

    // Get completed requests count
    const completedRequests = await query(`
      SELECT COUNT(*) as count 
      FROM work_requests wr
      LEFT JOIN status s ON wr.status_id = s.id
      WHERE s.name = 'Completed'
    `);

    // Get pending requests count (not yet approved)
    const pendingRequests = await query(`
      SELECT COUNT(*) as count 
      FROM work_requests wr
      LEFT JOIN status s ON wr.status_id = s.id
      WHERE s.name = 'Pending'
    `);

    // Get pending approvals count (awaiting CEO decision)
    const pendingApprovals = await query(`
      SELECT COUNT(*) as count 
      FROM work_request_approvals wra 
      WHERE wra.approval_status = 'pending'
    `);

    // Get approved requests count (last 30 days)
    const approvedRequests = await query(`
      SELECT COUNT(*) as count 
      FROM work_request_approvals wra 
      WHERE wra.approval_status = 'approved'
      AND wra.approval_date >= CURRENT_DATE - INTERVAL '30 days'
    `);

    // Get rejected requests count (last 30 days)
    const rejectedRequests = await query(`
      SELECT COUNT(*) as count 
      FROM work_request_approvals wra 
      WHERE wra.approval_status = 'rejected'
      AND wra.approval_date >= CURRENT_DATE - INTERVAL '30 days'
    `);

    // Get total users count
    const totalUsers = await query(`
      SELECT COUNT(*) as count FROM users
    `);

    // Get total agents count
    const totalAgents = await query(`
      SELECT COUNT(*) as count FROM agents
    `);

    // Get total budget (sum of budget_code values where numeric)
    const totalBudget = await query(`
      SELECT COALESCE(SUM(CAST(budget_code AS NUMERIC)), 0) as total
      FROM work_requests 
      WHERE budget_code ~ '^[0-9]+$'
    `);

    // Get recent requests (last 50 for pagination)
    const recentRequests = await query(`
      SELECT 
        wr.id,
        wr.request_date,
        wr.description,
        wr.address,
        wr.contact_number,
        ct.type_name as complaint_type,
        t.town,
        st.subtown,
        u.name as creator_name,
        wra.approval_status,
        wra.created_at as approval_request_date
      FROM work_requests wr
      LEFT JOIN work_request_approvals wra ON wr.id = wra.work_request_id
      LEFT JOIN complaint_types ct ON wr.complaint_type_id = ct.id
      LEFT JOIN town t ON wr.town_id = t.id
      LEFT JOIN subtown st ON wr.subtown_id = st.id
      LEFT JOIN users u ON wr.creator_id = u.id
      ORDER BY wr.created_date DESC
      LIMIT 50
    `);

    // Get monthly request trends (last 12 months)
    const monthlyTrends = await query(`
      SELECT 
        DATE_TRUNC('month', created_date) as month,
        COUNT(*) as count
      FROM work_requests
      WHERE created_date >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_date)
      ORDER BY month ASC
    `);

    // Get request type distribution
    const requestTypeDistribution = await query(`
      SELECT 
        ct.type_name as type,
        COUNT(*) as count
      FROM work_requests wr
      LEFT JOIN complaint_types ct ON wr.complaint_type_id = ct.id
      GROUP BY ct.type_name
      ORDER BY count DESC
    `);

    // Get status distribution
    const statusDistribution = await query(`
      SELECT 
        s.name as status,
        COUNT(*) as count
      FROM work_requests wr
      LEFT JOIN status s ON wr.status_id = s.id
      GROUP BY s.name
      ORDER BY count DESC
    `);

    // Get district-wise distribution
    const districtDistribution = await query(`
      SELECT 
        d.title as district,
        COUNT(*) as count
      FROM work_requests wr
      LEFT JOIN town t ON wr.town_id = t.id
      LEFT JOIN district d ON t.district_id = d.id
      GROUP BY d.title
      ORDER BY count DESC
      LIMIT 10
    `);

    const analyticsData = {
      // Main statistics
      totalRequests: parseInt(totalRequests.rows?.[0]?.count || 0),
      activeRequests: parseInt(activeRequests.rows?.[0]?.count || 0),
      completedRequests: parseInt(completedRequests.rows?.[0]?.count || 0),
      pendingRequests: parseInt(pendingRequests.rows?.[0]?.count || 0),
      pendingApprovals: parseInt(pendingApprovals.rows?.[0]?.count || 0),
      approvedRequests: parseInt(approvedRequests.rows?.[0]?.count || 0),
      rejectedRequests: parseInt(rejectedRequests.rows?.[0]?.count || 0),
      totalUsers: parseInt(totalUsers.rows?.[0]?.count || 0),
      totalAgents: parseInt(totalAgents.rows?.[0]?.count || 0),
      totalBudget: parseInt(totalBudget.rows?.[0]?.total || 0),
      
      // Recent activity
      recentRequests: recentRequests.rows || [],
      
      // Charts data
      monthlyTrends: monthlyTrends.rows || [],
      requestTypeDistribution: requestTypeDistribution.rows || [],
      statusDistribution: statusDistribution.rows || [],
      districtDistribution: districtDistribution.rows || []
    };

    return NextResponse.json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('Error fetching CEO analytics:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
