import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { query } from "@/lib/db";
import { logUserAction } from "@/lib/userActionLogger";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admin users (role 1) to access this endpoint
    if (!session?.user || session.user.userType !== 'user' || parseInt(session.user.role) !== 1) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    // Fetch all complaint types
    const complaintTypes = await query(`
      SELECT 
        ct.id,
        ct.type_name,
        ct.description,
        ct.created_date,
        ct.updated_date,
        COUNT(cst.id) as subtype_count,
        COUNT(ceud.id) as assigned_ce_count
      FROM complaint_types ct
      LEFT JOIN complaint_subtypes cst ON ct.id = cst.complaint_type_id
      LEFT JOIN ce_user_departments ceud ON ct.id = ceud.complaint_type_id
      GROUP BY ct.id, ct.type_name, ct.description, ct.created_date, ct.updated_date
      ORDER BY ct.type_name ASC
    `);

    return NextResponse.json({
      success: true,
      data: complaintTypes.rows
    });

  } catch (error) {
    console.error('Error in complaint types GET API:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admin users (role 1) to access this endpoint
    if (!session?.user || session.user.userType !== 'user' || parseInt(session.user.role) !== 1) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type_name, description } = body;

    // Validate required fields
    if (!type_name || !type_name.trim()) {
      return NextResponse.json(
        { success: false, message: "Type name is required." },
        { status: 400 }
      );
    }

    // Check if complaint type with this name already exists
    const existingType = await query(`
      SELECT id FROM complaint_types WHERE LOWER(type_name) = LOWER($1)
    `, [type_name.trim()]);

    if (existingType.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "A complaint type with this name already exists." },
        { status: 400 }
      );
    }

    // Create new complaint type
    const result = await query(`
      INSERT INTO complaint_types (type_name, description, created_date, updated_date)
      VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [type_name.trim(), description?.trim() || null]);

    // Log the action
    await logUserAction({
      user_id: session.user.id,
      user_type: 'admin',
      user_role: 1,
      user_name: session.user.name || 'Admin',
      user_email: session.user.email,
      action_type: 'CREATE_COMPLAINT_TYPE',
      entity_type: 'COMPLAINT_TYPE',
      entity_id: result.rows[0].id,
      details: `Admin created complaint type: ${type_name}`,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: "Complaint type created successfully",
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error in complaint types POST API:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { query } from "@/lib/db";
import { logUserAction } from "@/lib/userActionLogger";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admin users (role 1) to access this endpoint
    if (!session?.user || session.user.userType !== 'user' || parseInt(session.user.role) !== 1) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    // Fetch all complaint types
    const complaintTypes = await query(`
      SELECT 
        ct.id,
        ct.type_name,
        ct.description,
        ct.created_date,
        ct.updated_date,
        COUNT(cst.id) as subtype_count,
        COUNT(ceud.id) as assigned_ce_count
      FROM complaint_types ct
      LEFT JOIN complaint_subtypes cst ON ct.id = cst.complaint_type_id
      LEFT JOIN ce_user_departments ceud ON ct.id = ceud.complaint_type_id
      GROUP BY ct.id, ct.type_name, ct.description, ct.created_date, ct.updated_date
      ORDER BY ct.type_name ASC
    `);

    return NextResponse.json({
      success: true,
      data: complaintTypes.rows
    });

  } catch (error) {
    console.error('Error in complaint types GET API:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admin users (role 1) to access this endpoint
    if (!session?.user || session.user.userType !== 'user' || parseInt(session.user.role) !== 1) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type_name, description } = body;

    // Validate required fields
    if (!type_name || !type_name.trim()) {
      return NextResponse.json(
        { success: false, message: "Type name is required." },
        { status: 400 }
      );
    }

    // Check if complaint type with this name already exists
    const existingType = await query(`
      SELECT id FROM complaint_types WHERE LOWER(type_name) = LOWER($1)
    `, [type_name.trim()]);

    if (existingType.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "A complaint type with this name already exists." },
        { status: 400 }
      );
    }

    // Create new complaint type
    const result = await query(`
      INSERT INTO complaint_types (type_name, description, created_date, updated_date)
      VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [type_name.trim(), description?.trim() || null]);

    // Log the action
    await logUserAction({
      user_id: session.user.id,
      user_type: 'admin',
      user_role: 1,
      user_name: session.user.name || 'Admin',
      user_email: session.user.email,
      action_type: 'CREATE_COMPLAINT_TYPE',
      entity_type: 'COMPLAINT_TYPE',
      entity_id: result.rows[0].id,
      details: `Admin created complaint type: ${type_name}`,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: "Complaint type created successfully",
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error in complaint types POST API:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
