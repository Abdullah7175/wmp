import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { query } from "@/lib/db";
import { logUserAction } from "@/lib/userActionLogger";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admin users (role 1) to access this endpoint
    if (!session?.user || session.user.userType !== 'user' || parseInt(session.user.role) !== 1) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Fetch complaint type with related data
    const complaintType = await query(`
      SELECT 
        ct.id,
        ct.type_name,
        ct.description,
        ct.created_date,
        ct.updated_date,
        COUNT(cst.id) as subtype_count,
        COUNT(ceud.id) as assigned_ce_count,
        array_agg(
          json_build_object(
            'id', cst.id,
            'subtype_name', cst.subtype_name,
            'description', cst.description
          )
        ) FILTER (WHERE cst.id IS NOT NULL) as subtypes,
        array_agg(
          json_build_object(
            'id', u.id,
            'name', u.name,
            'email', u.email,
            'designation', ce.designation
          )
        ) FILTER (WHERE u.id IS NOT NULL) as assigned_ce_users
      FROM complaint_types ct
      LEFT JOIN complaint_subtypes cst ON ct.id = cst.complaint_type_id
      LEFT JOIN ce_user_departments ceud ON ct.id = ceud.complaint_type_id
      LEFT JOIN ce_users ce ON ceud.ce_user_id = ce.id
      LEFT JOIN users u ON ce.user_id = u.id
      WHERE ct.id = $1
      GROUP BY ct.id, ct.type_name, ct.description, ct.created_date, ct.updated_date
    `, [id]);

    if (complaintType.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Complaint type not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: complaintType.rows[0]
    });

  } catch (error) {
    console.error('Error in complaint type GET API:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admin users (role 1) to access this endpoint
    if (!session?.user || session.user.userType !== 'user' || parseInt(session.user.role) !== 1) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { type_name, description } = body;

    // Validate required fields
    if (!type_name || !type_name.trim()) {
      return NextResponse.json(
        { success: false, message: "Type name is required." },
        { status: 400 }
      );
    }

    // Check if complaint type exists
    const existingType = await query(`
      SELECT id, type_name FROM complaint_types WHERE id = $1
    `, [id]);

    if (existingType.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Complaint type not found." },
        { status: 404 }
      );
    }

    // Check if another complaint type with this name already exists
    const duplicateType = await query(`
      SELECT id FROM complaint_types WHERE LOWER(type_name) = LOWER($1) AND id != $2
    `, [type_name.trim(), id]);

    if (duplicateType.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "A complaint type with this name already exists." },
        { status: 400 }
      );
    }

    // Update complaint type
    const result = await query(`
      UPDATE complaint_types 
      SET type_name = $1, description = $2, updated_date = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [type_name.trim(), description?.trim() || null, id]);

    // Log the action
    await logUserAction({
      user_id: session.user.id,
      user_type: 'admin',
      user_role: 1,
      user_name: session.user.name || 'Admin',
      user_email: session.user.email,
      action_type: 'UPDATE_COMPLAINT_TYPE',
      entity_type: 'COMPLAINT_TYPE',
      entity_id: parseInt(id),
      details: `Admin updated complaint type: ${existingType.rows[0].type_name} -> ${type_name}`,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: "Complaint type updated successfully",
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error in complaint type PUT API:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admin users (role 1) to access this endpoint
    if (!session?.user || session.user.userType !== 'user' || parseInt(session.user.role) !== 1) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if complaint type exists and get its name for logging
    const existingType = await query(`
      SELECT id, type_name FROM complaint_types WHERE id = $1
    `, [id]);

    if (existingType.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Complaint type not found." },
        { status: 404 }
      );
    }

    // Check if complaint type is being used by work requests
    const workRequestsCount = await query(`
      SELECT COUNT(*) as count FROM work_requests WHERE complaint_type_id = $1
    `, [id]);

    if (parseInt(workRequestsCount.rows[0].count) > 0) {
      return NextResponse.json(
        { success: false, message: "Cannot delete complaint type. It is being used by existing work requests." },
        { status: 400 }
      );
    }

    // Check if complaint type is assigned to CE users
    const ceUsersCount = await query(`
      SELECT COUNT(*) as count FROM ce_user_departments WHERE complaint_type_id = $1
    `, [id]);

    if (parseInt(ceUsersCount.rows[0].count) > 0) {
      return NextResponse.json(
        { success: false, message: "Cannot delete complaint type. It is assigned to CE users. Please reassign or remove CE users first." },
        { status: 400 }
      );
    }

    // Delete complaint type (this will cascade delete subtypes due to foreign key constraint)
    await query(`
      DELETE FROM complaint_types WHERE id = $1
    `, [id]);

    // Log the action
    await logUserAction({
      user_id: session.user.id,
      user_type: 'admin',
      user_role: 1,
      user_name: session.user.name || 'Admin',
      user_email: session.user.email,
      action_type: 'DELETE_COMPLAINT_TYPE',
      entity_type: 'COMPLAINT_TYPE',
      entity_id: parseInt(id),
      details: `Admin deleted complaint type: ${existingType.rows[0].type_name}`,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: "Complaint type deleted successfully"
    });

  } catch (error) {
    console.error('Error in complaint type DELETE API:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}