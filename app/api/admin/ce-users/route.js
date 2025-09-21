import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
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

    // Fetch all CE users with their departments
    const ceUsers = await query(`
      SELECT 
        cu.id,
        cu.user_id,
        cu.designation,
        cu.address,
        cu.created_at,
        cu.updated_at,
        u.name,
        u.email,
        u.contact_number,
        u.created_date,
        array_agg(
          json_build_object(
            'id', ct.id,
            'type_name', ct.type_name
          )
        ) as departments
      FROM ce_users cu
      LEFT JOIN users u ON cu.user_id = u.id
      LEFT JOIN ce_user_departments cud ON cu.id = cud.ce_user_id
      LEFT JOIN complaint_types ct ON cud.complaint_type_id = ct.id
      GROUP BY cu.id, cu.user_id, cu.designation, cu.address, cu.created_at, cu.updated_at,
               u.name, u.email, u.contact_number, u.created_date
      ORDER BY cu.created_at DESC
    `);

    // Process the departments array to remove null values
    const processedUsers = ceUsers.rows.map(user => ({
      ...user,
      departments: user.departments.filter(dept => dept.id !== null)
    }));

    return NextResponse.json({
      success: true,
      data: processedUsers
    });

  } catch (error) {
    console.error('Error in CE users GET API:', error);
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
    const { name, email, password, contact_number, designation, address, departments } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (!departments || departments.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one department must be selected." },
        { status: 400 }
      );
    }

    // Check if user with this email already exists
    const existingUser = await query(`
      SELECT id FROM users WHERE email = $1
    `, [email]);

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "User with this email already exists." },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Start transaction
    const client = await query.getClient();
    await client.query('BEGIN');

    try {
      // Create user with role 7 (CE)
      const userResult = await client.query(`
        INSERT INTO users (name, email, password, contact_number, role, created_date, updated_date)
        VALUES ($1, $2, $3, $4, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `, [name, email, hashedPassword, contact_number]);

      const userId = userResult.rows[0].id;

      // Create CE user record
      const ceUserResult = await client.query(`
        INSERT INTO ce_users (user_id, designation, address, created_at, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `, [userId, designation, address]);

      const ceUserId = ceUserResult.rows[0].id;

      // Create department assignments
      for (const departmentId of departments) {
        await client.query(`
          INSERT INTO ce_user_departments (ce_user_id, complaint_type_id, created_at)
          VALUES ($1, $2, CURRENT_TIMESTAMP)
        `, [ceUserId, departmentId]);
      }

      // Commit transaction
      await client.query('COMMIT');

      // Log the action
      await logUserAction({
        user_id: session.user.id,
        user_type: 'admin',
        user_role: 1,
        user_name: session.user.name || 'Admin',
        user_email: session.user.email,
        action_type: 'CREATE_CE_USER',
        entity_type: 'CE_USER',
        entity_id: ceUserId,
        details: `Admin created CE user: ${name} (${email}) with departments: ${departments.join(', ')}`,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      });

      return NextResponse.json({
        success: true,
        message: "CE user created successfully",
        data: { id: ceUserId, user_id: userId }
      });

    } catch (error) {
      // Rollback transaction
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error in CE users POST API:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}