import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { connectToDatabase } from "@/lib/db";

export async function GET() {
  let client;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || parseInt(session.user.role) !== 7 || session.user.userType !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    client = await connectToDatabase();

    // Get CE user profile
    const result = await client.query(`
      SELECT 
        u.*,
        cu.department_id,
        cu.designation,
        cu.department,
        cu.address
      FROM users u
      LEFT JOIN ce_users cu ON u.id = cu.user_id
      WHERE u.id = $1
    `, [session.user.id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'CE user not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching CE profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function PUT(request) {
  let client;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || parseInt(session.user.role) !== 7 || session.user.userType !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, contact_number, department, designation, address } = await request.json();

    client = await connectToDatabase();

    // Update user table
    await client.query(`
      UPDATE users 
      SET 
        name = $1,
        email = $2,
        contact_number = $3,
        updated_date = NOW()
      WHERE id = $4
    `, [name, email, contact_number, session.user.id]);

    // Update or insert CE user info
    await client.query(`
      INSERT INTO ce_users (user_id, department_id, designation, department, address, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET
        designation = $3,
        department = $4,
        address = $5,
        updated_at = NOW()
    `, [session.user.id, null, designation, department, address]);

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    });

  } catch (error) {
    console.error('Error updating CE profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
