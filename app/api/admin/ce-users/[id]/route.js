import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { connectToDatabase } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(request, { params }) {
  let client;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || parseInt(session.user.role) !== 1 || session.user.userType !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    client = await connectToDatabase();

    // Get CE user details
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
      WHERE u.id = $1 AND u.role = 7
    `, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'CE user not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching CE user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function PUT(request, { params }) {
  let client;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || parseInt(session.user.role) !== 1 || session.user.userType !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { name, email, contact_number, department, designation, address, password } = await request.json();

    client = await connectToDatabase();

    // Check if user exists
    const existingUser = await client.query('SELECT id FROM users WHERE id = $1 AND role = 7', [id]);
    if (existingUser.rows.length === 0) {
      return NextResponse.json({ error: 'CE user not found' }, { status: 404 });
    }

    // Check if email is already taken by another user
    if (email) {
      const emailCheck = await client.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
      if (emailCheck.rows.length > 0) {
        return NextResponse.json({ error: 'Email already taken by another user' }, { status: 400 });
      }
    }

    // Update user table
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (name) {
      updateFields.push(`name = $${paramCount++}`);
      updateValues.push(name);
    }
    if (email) {
      updateFields.push(`email = $${paramCount++}`);
      updateValues.push(email);
    }
    if (contact_number !== undefined) {
      updateFields.push(`contact_number = $${paramCount++}`);
      updateValues.push(contact_number);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push(`password = $${paramCount++}`);
      updateValues.push(hashedPassword);
    }
    
    updateFields.push(`updated_date = NOW()`);
    updateValues.push(id);

    if (updateFields.length > 1) {
      await client.query(`
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
      `, updateValues);
    }

    // Update CE user details
    const ceUpdateFields = [];
    const ceUpdateValues = [];
    let ceParamCount = 1;

    if (department) {
      ceUpdateFields.push(`department = $${ceParamCount++}`);
      ceUpdateValues.push(department);
    }
    if (designation !== undefined) {
      ceUpdateFields.push(`designation = $${ceParamCount++}`);
      ceUpdateValues.push(designation);
    }
    if (address !== undefined) {
      ceUpdateFields.push(`address = $${ceParamCount++}`);
      ceUpdateValues.push(address);
    }
    
    ceUpdateFields.push(`updated_at = NOW()`);
    ceUpdateValues.push(id);

    if (ceUpdateFields.length > 1) {
      await client.query(`
        UPDATE ce_users 
        SET ${ceUpdateFields.join(', ')}
        WHERE user_id = $${ceParamCount}
      `, ceUpdateValues);
    }

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
      'UPDATE',
      'ce_user',
      id,
      name || 'CE User',
      JSON.stringify({
        email: email,
        department: department,
        designation: designation
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      message: 'CE user updated successfully' 
    });

  } catch (error) {
    console.error('Error updating CE user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function DELETE(request, { params }) {
  let client;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || parseInt(session.user.role) !== 1 || session.user.userType !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    client = await connectToDatabase();

    // Check if user exists
    const existingUser = await client.query('SELECT name FROM users WHERE id = $1 AND role = 7', [id]);
    if (existingUser.rows.length === 0) {
      return NextResponse.json({ error: 'CE user not found' }, { status: 404 });
    }

    const userName = existingUser.rows[0].name;

    // Delete CE user details first (due to foreign key constraint)
    await client.query('DELETE FROM ce_users WHERE user_id = $1', [id]);

    // Delete user
    await client.query('DELETE FROM users WHERE id = $1', [id]);

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
      'DELETE',
      'ce_user',
      id,
      userName,
      JSON.stringify({})
    ]);

    return NextResponse.json({ 
      success: true, 
      message: 'CE user deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting CE user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
