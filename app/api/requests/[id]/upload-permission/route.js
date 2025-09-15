import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { query } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const mediaType = searchParams.get('type'); // 'images', 'videos', 'final_videos'

    if (!id || !mediaType) {
      return NextResponse.json(
        { success: false, message: "Work request ID and media type are required" },
        { status: 400 }
      );
    }

    // Get work request approval status
    const approvalStatus = await query(`
      SELECT 
        wra.approval_status,
        wr.id,
        wr.description,
        wr.creator_id,
        wr.creator_type
      FROM work_requests wr
      LEFT JOIN work_request_approvals wra ON wr.id = wra.work_request_id
      WHERE wr.id = $1
    `, [id]);

    if (!approvalStatus.rows || approvalStatus.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Work request not found" },
        { status: 404 }
      );
    }

    const request = approvalStatus.rows[0];
    const isApproved = request.approval_status === 'approved';
    const isRejected = request.approval_status === 'rejected';
    const isPending = request.approval_status === 'pending';

    // Check if user is the creator of the request
    const isCreator = (
      (session.user.userType === 'user' && request.creator_type === 'user' && session.user.id === request.creator_id) ||
      (session.user.userType === 'agent' && request.creator_type === 'agent' && session.user.id === request.creator_id) ||
      (session.user.userType === 'socialmedia' && request.creator_type === 'socialmedia' && session.user.id === request.creator_id)
    );

    // Check if user is CEO or admin
    const isCEO = session.user.userType === 'user' && session.user.role === 5;
    const isAdmin = session.user.userType === 'user' && (session.user.role === 1 || session.user.role === 2);

    let canUpload = false;
    let reason = "";
    let allowedMediaTypes = [];

    if (isRejected) {
      // Rejected requests - only CEO and admin can make them live again
      if (isCEO || isAdmin) {
        canUpload = true;
        allowedMediaTypes = ['images', 'videos', 'final_videos'];
        reason = "Request can be reactivated by CEO/Admin";
      } else {
        canUpload = false;
        reason = "Request rejected by CEO KW&SC. Only CEO or Admin can reactivate.";
      }
    } else if (isPending) {
      // Pending approval - only before images allowed
      if (isCreator || isCEO || isAdmin) {
        canUpload = true;
        allowedMediaTypes = ['before_images'];
        reason = "Only before images allowed before CEO approval";
      } else {
        canUpload = false;
        reason = "Request pending CEO approval";
      }
    } else if (isApproved) {
      // Approved requests - all media types allowed
      if (isCreator || isCEO || isAdmin) {
        canUpload = true;
        allowedMediaTypes = ['before_images', 'images', 'videos', 'final_videos'];
        reason = "Request approved by CEO - all media uploads allowed";
      } else {
        canUpload = false;
        reason = "Only request creators, CEO, or Admin can upload media";
      }
    } else {
      // No approval record found (should not happen for new requests)
      canUpload = false;
      reason = "Request approval status unknown";
    }

    // Check if the requested media type is allowed
    const isMediaTypeAllowed = allowedMediaTypes.includes(mediaType);

    return NextResponse.json({
      success: true,
      data: {
        canUpload: canUpload && isMediaTypeAllowed,
        approvalStatus: request.approval_status,
        allowedMediaTypes,
        requestedMediaType: mediaType,
        isMediaTypeAllowed,
        reason: isMediaTypeAllowed ? reason : `Media type '${mediaType}' not allowed for current approval status`,
        isCreator,
        isCEO,
        isAdmin
      }
    });

  } catch (error) {
    console.error('Error checking upload permission:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
