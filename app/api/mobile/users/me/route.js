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

    // Build user response object
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image || '/avatar.png',
      role: user.role,
      userType: decoded.userType === 'agents' ? 'agent' : (decoded.userType === 'socialmediaperson' ? 'socialmedia' : 'user'),
      contact_number: user.contact_number || null,
      address: user.address || null,
      designation: user.designation || null
    };

    // For agents and socialmediaperson, add location and department fields
    if (decoded.userType === 'agents' || decoded.userType === 'socialmediaperson') {
      // Get complaint_type_id, town_id, division_id from user record
      const complaintTypeId = user.complaint_type_id || null;
      const townId = user.town_id || null;
      const divisionId = user.division_id || null;

      // Determine if division-based
      let isDivisionBased = false;
      if (divisionId) {
        // If division_id exists, it's division-based
        isDivisionBased = true;
      } else if (complaintTypeId) {
        // Check complaint_type to see if it's division-based
        try {
          const complaintTypeRes = await client.query(`
            SELECT 
              ct.division_id,
              ct.is_division_based,
              ed.department_type
            FROM complaint_types ct
            LEFT JOIN efiling_departments ed ON ct.efiling_department_id = ed.id
            WHERE ct.id = $1
          `, [complaintTypeId]);

          if (complaintTypeRes.rows.length > 0) {
            const ct = complaintTypeRes.rows[0];
            isDivisionBased = Boolean(
              ct.is_division_based ||
              ct.division_id ||
              ct.department_type === 'division'
            );
          }
        } catch (err) {
          console.warn('Error checking complaint type for division-based flag:', err);
          // Default to false if we can't determine
        }
      }

      // Add location and department fields to user response
      userResponse.complaint_type_id = complaintTypeId;
      userResponse.town_id = townId;
      userResponse.division_id = divisionId;
      userResponse.is_division_based = isDivisionBased;
    }

    // Return in mobile app format
    return NextResponse.json({
      success: true,
      data: userResponse
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching mobile user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
