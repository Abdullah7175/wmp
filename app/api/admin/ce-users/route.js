import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { connectToDatabase } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  let client;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || parseInt(session.user.role) !== 1 || session.user.userType !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    client = await connectToDatabase();

    // Get all CE users with their details
    const result = await client.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.contact_number,
        u.created_date,
        u.updated_date,
        cu.department_id,
        cu.designation,
        cu.department,
        cu.address,
        cu.created_at as ce_created_at,
        cu.updated_at as ce_updated_at
      FROM users u
      LEFT JOIN ce_users cu ON u.id = cu.user_id
      WHERE u.role = 7
      ORDER BY u.created_date DESC
    `);

    return NextResponse.json(result.rows);

  } catch (error) {
    console.error('Error fetching CE users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function POST(request) {
  let client;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || parseInt(session.user.role) !== 1 || session.user.userType !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, password, contact_number, department, designation, address, role } = await request.json();

    if (!name || !email || !password || !department) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['water', 'sewerage'].includes(department)) {
      return NextResponse.json({ error: 'Invalid department. Must be water or sewerage' }, { status: 400 });
    }

    client = await connectToDatabase();

    // Check if user already exists
    const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userResult = await client.query(`
      INSERT INTO users (name, email, password, contact_number, role, created_date, updated_date)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, name, email, contact_number, created_date
    `, [name, email, hashedPassword, contact_number, role || 7]);

    const userId = userResult.rows[0].id;

    // Create CE user details
    await client.query(`
      INSERT INTO ce_users (user_id, department_id, designation, department, address, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    `, [userId, null, designation, department, address]);

    // Log the action
    await client.query(`
      INSERT INTO user_actions (
        user_id, user_type, user_role, user_name, user_email,
        action_type, entity_type, entity_id, entity_name, details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      session.user.id,
      'user',
      1,
      session.user.name,
      session.user.email,
      'CREATE',
      'ce_user',
      userId,
      name,
      JSON.stringify({
        email: email,
        department: department,
        designation: designation
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      message: 'CE user created successfully',
      user: userResult.rows[0]
    });

  } catch (error) {
    console.error('Error creating CE user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
