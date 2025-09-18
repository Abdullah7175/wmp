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

    // Get CE user info with assigned departments
    const result = await client.query(`
      SELECT 
        u.name,
        u.email,
        cu.designation,
        ARRAY_AGG(
          JSON_BUILD_OBJECT(
            'id', ct.id,
            'name', ct.type_name
          )
        ) as assigned_departments
      FROM users u
      LEFT JOIN ce_users cu ON u.id = cu.user_id
      LEFT JOIN ce_user_departments cud ON cu.id = cud.ce_user_id
      LEFT JOIN complaint_types ct ON cud.complaint_type_id = ct.id
      WHERE u.id = $1
      GROUP BY u.name, u.email, cu.designation
    `, [session.user.id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'CE user not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching CE user info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
