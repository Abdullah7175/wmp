import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { validateMobileApiToken } from '@/middleware/mobileApiAuth';
import { getMobileUserToken } from '@/lib/mobileAuthHelper';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    // Validate API key
    const apiKeyError = validateMobileApiToken(req);
    if (apiKeyError) {
      return apiKeyError;
    }

    // Get and verify JWT token from header
    const decoded = getMobileUserToken(req);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing token' },
        { status: 401 }
      );
    }

    const client = await connectToDatabase();

    // Map userType from token to table name
    let query, table;
    switch(decoded.userType) {
      case 'agents':
        query = 'SELECT * FROM agents WHERE email = $1';
        table = 'agents';
        break;
      case 'socialmediaperson':
        query = 'SELECT * FROM socialmediaperson WHERE email = $1';
        table = 'socialmediaperson';
        break;
      default:
        query = 'SELECT * FROM users WHERE email = $1';
        table = 'users';
    }

    const result = await client.query(query, [decoded.email]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    // Return in mobile app format
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image || '/avatar.png',
        role: user.role,
        userType: decoded.userType === 'agents' ? 'agent' : (decoded.userType === 'socialmediaperson' ? 'socialmedia' : 'user'),
        contact_number: user.contact_number || null,
        address: user.address || null,
        designation: user.designation || null
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching mobile user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
