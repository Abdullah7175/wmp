import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import fs from "fs/promises";
import path from "path";
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

    // Log CEO profile access
    await logUserAction({
      userId: session.user.id,
      userType: 'ceo',
      action: 'VIEW_PROFILE',
      entityType: 'USER_PROFILE',
      entityId: session.user.id,
      details: 'CEO accessed profile page',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    // Get CEO profile
    const result = await query(`
      SELECT 
        id,
        name,
        email,
        contact_number,
        image,
        created_date,
        updated_date
      FROM users 
      WHERE id = $1 AND role = 5
    `, [session.user.id]);

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching CEO profile:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow CEO users (role 5) to update their profile
    if (!session?.user || session.user.userType !== 'user' || parseInt(session.user.role) !== 5) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. CEO access required." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const contact_number = formData.get('contact_number');
    const imageFile = formData.get('image');

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, session.user.id]
    );

    if (existingUser.rows && existingUser.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "Email already exists. Please use a different email address." },
        { status: 400 }
      );
    }

    let imagePath = null;
    if (imageFile && imageFile.size > 0) {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'users');
      await fs.mkdir(uploadsDir, { recursive: true });
      
      // Generate unique filename
      const filename = `${Date.now()}-${imageFile.name}`;
      const filePath = path.join(uploadsDir, filename);
      
      // Save file
      const buffer = await imageFile.arrayBuffer();
      await fs.writeFile(filePath, Buffer.from(buffer));
      
      imagePath = `/uploads/users/${filename}`;
    }

    // Update user profile
    let updateQuery;
    let queryParams;

    if (imagePath) {
      updateQuery = `
        UPDATE users 
        SET name = $1, email = $2, contact_number = $3, image = $4, updated_date = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING id, name, email, contact_number, image, created_date, updated_date
      `;
      queryParams = [name, email, contact_number || '', imagePath, session.user.id];
    } else {
      updateQuery = `
        UPDATE users 
        SET name = $1, email = $2, contact_number = $3, updated_date = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING id, name, email, contact_number, image, created_date, updated_date
      `;
      queryParams = [name, email, contact_number || '', session.user.id];
    }

    const result = await query(updateQuery, queryParams);

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Failed to update profile" },
        { status: 500 }
      );
    }

    const updatedUser = result.rows[0];

    // Log CEO profile update
    await logUserAction({
      userId: session.user.id,
      userType: 'ceo',
      action: 'UPDATE_PROFILE',
      entityType: 'USER_PROFILE',
      entityId: session.user.id,
      details: `CEO updated profile: name=${name}, email=${email}, contact=${contact_number}, image=${imagePath ? 'updated' : 'unchanged'}`,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating CEO profile:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
