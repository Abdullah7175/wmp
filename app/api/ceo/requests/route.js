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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    // Log CEO request list access
    await logUserAction({
      userId: session.user.id,
      userType: 'ceo',
      action: 'VIEW_REQUESTS',
      entityType: 'WORK_REQUESTS',
      entityId: null,
      details: `CEO viewed ${status} requests list`,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    let whereClause = '';
    let orderClause = 'ORDER BY wra.created_at DESC';

    switch (status) {
      case 'pending':
        whereClause = "WHERE wra.approval_status = 'pending'";
        break;
      case 'approved':
        whereClause = "WHERE wra.approval_status = 'approved'";
        orderClause = 'ORDER BY wra.approval_date DESC';
        break;
      case 'rejected':
        whereClause = "WHERE wra.approval_status = 'rejected'";
        orderClause = 'ORDER BY wra.approval_date DESC';
        break;
      default:
        whereClause = "WHERE wra.approval_status = 'pending'";
    }

    const requests = await query(`
      SELECT 
        wr.id,
        wr.request_date,
        wr.description,
        wr.address,
        wr.contact_number,
        wr.created_date,
        wr.nature_of_work,
        wr.budget_code,
        wr.file_type,
        ct.type_name as complaint_type,
        cst.subtype_name as complaint_subtype,
        t.town,
        st.subtown,
        d.title as district,
        u.name as creator_name,
        u.email as creator_email,
        wra.approval_status,
        wra.created_at as approval_request_date,
        wra.approval_date,
        wra.ceo_comments,
        wra.rejection_reason,
        s.name as status_name
      FROM work_requests wr
      LEFT JOIN work_request_approvals wra ON wr.id = wra.work_request_id
      LEFT JOIN complaint_types ct ON wr.complaint_type_id = ct.id
      LEFT JOIN complaint_subtypes cst ON wr.complaint_subtype_id = cst.id
      LEFT JOIN town t ON wr.town_id = t.id
      LEFT JOIN subtown st ON wr.subtown_id = st.id
      LEFT JOIN district d ON t.district_id = d.id
      LEFT JOIN users u ON wr.creator_id = u.id
      LEFT JOIN status s ON wr.status_id = s.id
      ${whereClause}
      ${orderClause}
    `);

    return NextResponse.json({
      success: true,
      data: requests.rows || []
    });

  } catch (error) {
    console.error('Error fetching CEO requests:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}