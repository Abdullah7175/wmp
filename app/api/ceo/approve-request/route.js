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

    const { workRequestId, comments } = await request.json();

    if (!workRequestId || !comments?.trim()) {
      return NextResponse.json(
        { success: false, message: "Work request ID and comments are required" },
        { status: 400 }
      );
    }

    // Check if request exists
    const existingRequest = await query(`
      SELECT id FROM work_requests WHERE id = $1
    `, [workRequestId]);

    if (!existingRequest.rows || existingRequest.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Request not found" },
        { status: 404 }
      );
    }

    // Insert or update CEO comment in work_request_approvals table
    const upsertQuery = `
      INSERT INTO work_request_approvals (work_request_id, ceo_id, approval_status, ceo_comments, created_at, updated_at)
      VALUES ($1, $2, 'pending', $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (work_request_id) 
      DO UPDATE SET 
        ceo_comments = $3,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await query(upsertQuery, [
      workRequestId,
      session.user.id,
      comments.trim()
    ]);

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Failed to add comment" },
        { status: 500 }
      );
    }

    // Log CEO comment action
    await logUserAction({
      user_id: session.user.id,
      user_type: 'ceo',
      user_role: 5,
      user_name: session.user.name || 'CEO',
      user_email: session.user.email,
      action_type: 'ADD_COMMENT',
      entity_type: 'WORK_REQUEST',
      entity_id: workRequestId,
      details: `CEO added comment to work request #${workRequestId}. Comment: ${comments.trim()}`,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
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
        'ceo_comment',
        workRequestId,
        `CEO KW&SC added a comment to your work request #${workRequestId}`
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
      'COMMENT',
      'work_request',
      workRequestId,
      `Work Request #${workRequestId}`,
      JSON.stringify({
        comments: comments.trim(),
        requestDescription: requestDetails.rows[0]?.description
      })
    ]);

    return NextResponse.json({
      success: true,
      message: "Comment added successfully",
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error in CEO comment API:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
