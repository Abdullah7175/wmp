import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { query } from "@/lib/db";
import { logUserAction } from "@/lib/userActionLogger";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is CEO (role 5) and userType is 'user'
    if (!session?.user || parseInt(session.user.role) !== 5 || session.user.userType !== 'user') {
      return NextResponse.json(
        { success: false, message: "Unauthorized. CEO access required." },
        { status: 403 }
      );
    }

    const { workRequestId, approvalStatus, comments, rejectionReason } = await request.json();

    if (!workRequestId || !approvalStatus) {
      return NextResponse.json(
        { success: false, message: "Work request ID and approval status are required" },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected'].includes(approvalStatus)) {
      return NextResponse.json(
        { success: false, message: "Invalid approval status" },
        { status: 400 }
      );
    }

    if (approvalStatus === 'rejected' && !rejectionReason?.trim()) {
      return NextResponse.json(
        { success: false, message: "Rejection reason is required when rejecting a request" },
        { status: 400 }
      );
    }

    // Check if request exists and is pending approval
    const existingApproval = await query(`
      SELECT * FROM work_request_approvals 
      WHERE work_request_id = $1 AND approval_status = 'pending'
    `, [workRequestId]);

    if (!existingApproval.rows || existingApproval.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Request not found or already processed" },
        { status: 404 }
      );
    }

    // Update the approval record
    const updateQuery = `
      UPDATE work_request_approvals 
      SET 
        approval_status = $1,
        approval_date = CURRENT_TIMESTAMP,
        rejection_reason = $2,
        ceo_comments = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE work_request_id = $4 AND approval_status = 'pending'
      RETURNING *
    `;

    const result = await query(updateQuery, [
      approvalStatus,
      approvalStatus === 'rejected' ? rejectionReason : null,
      comments || null,
      workRequestId
    ]);

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Failed to update approval status" },
        { status: 500 }
      );
    }

    // Log CEO approval action
    await logUserAction({
      userId: session.user.id,
      userType: 'ceo',
      action: approvalStatus === 'approved' ? 'APPROVE_REQUEST' : 'REJECT_REQUEST',
      entityType: 'WORK_REQUEST',
      entityId: workRequestId,
      details: `CEO ${approvalStatus} work request #${workRequestId}. Comments: ${comments || 'None'}. ${approvalStatus === 'rejected' ? `Rejection reason: ${rejectionReason}` : ''}`,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    // Get request details for notification
    const requestDetails = await query(`
      SELECT 
        wr.id,
        wr.creator_id,
        wr.creator_type,
        wr.description,
        u.name as creator_name,
        u.email as creator_email
      FROM work_requests wr
      LEFT JOIN users u ON wr.creator_id = u.id
      WHERE wr.id = $1
    `, [workRequestId]);

    if (requestDetails.rows && requestDetails.rows.length > 0) {
      const request = requestDetails.rows[0];
      
      // Create notification for the request creator
      await query(`
        INSERT INTO notifications (user_id, type, entity_id, message, created_at, read)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, false)
      `, [
        request.creator_id,
        'ceo_approval',
        workRequestId,
        `Your work request #${workRequestId} has been ${approvalStatus} by CEO KW&SC${approvalStatus === 'rejected' ? `. Reason: ${rejectionReason}` : ''}`
      ]);
    }

    // Log the action
    await query(`
      INSERT INTO user_actions (
        user_id, user_type, user_role, user_name, user_email,
        action_type, entity_type, entity_id, entity_name,
        details, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
    `, [
      session.user.id,
      'user',
      5,
      session.user.name || 'CEO',
      session.user.email,
      approvalStatus === 'approved' ? 'APPROVE' : 'REJECT',
      'work_request',
      workRequestId,
      `Work Request #${workRequestId}`,
      JSON.stringify({
        approvalStatus,
        comments,
        rejectionReason,
        requestDescription: requestDetails[0]?.description
      })
    ]);

    return NextResponse.json({
      success: true,
      message: `Request ${approvalStatus} successfully`,
      data: result[0]
    });

  } catch (error) {
    console.error('Error in CEO approval API:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
