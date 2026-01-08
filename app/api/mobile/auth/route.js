/**
 * Mobile App Authentication API
 * 
 * This endpoint handles mobile app login and returns JWT token
 * Uses API key authentication for additional security layer
 */

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { validateMobileApiToken } from '@/middleware/mobileApiAuth';
import { actionLogger } from '@/lib/actionLogger';
import { eFilingLoginLogger } from '@/lib/efilingLoginLogger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/mobile/auth
 * Mobile app login endpoint
 * 
 * Request Body:
 *   {
 *     "email": "agent@example.com",
 *     "password": "password123"
 *   }
 * 
 * Headers:
 *   Authorization: Bearer <MOBILE_APP_API_KEY>
 * 
 * Response:
 *   {
 *     "success": true,
 *     "token": "jwt_token_here",
 *     "user": { ... }
 *   }
 */
export async function POST(req) {
  let client;
  try {
    // Validate mobile app API key
    const apiKeyError = validateMobileApiToken(req);
    if (apiKeyError) {
      return apiKeyError;
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    client = await connectToDatabase();

    // Check in all user tables (agents, socialmediaperson, users)
    const userTypes = [
      { table: 'users', query: 'SELECT * FROM users WHERE email = $1' },
      { table: 'agents', query: 'SELECT * FROM agents WHERE email = $1' },
      { table: 'socialmediaperson', query: 'SELECT * FROM socialmediaperson WHERE email = $1' }
    ];

    let user = null;
    let userType = null;

    for (const { table, query } of userTypes) {
      const result = await client.query(query, [email]);
      if (result.rows.length > 0) {
        user = result.rows[0];
        userType = table;
        break;
      }
    }

    if (!user) {
      // Log failed login attempt
      await eFilingLoginLogger.authAttempt(req, null, false, { email });
      
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      // Log failed password attempt
      await eFilingLoginLogger.authAttempt(req, null, false, { email });
      
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token (expires in 1 hour)
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        userType: userType,
        source: 'mobile_app' // Mark as mobile app token
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Log successful login
    if (userType === 'users') {
      await eFilingLoginLogger.login(req, {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        userType: userType
      }, {
        loginMethod: 'mobile_app',
        userType: userType
      });
    } else {
      await actionLogger.login(req, {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        userType: userType
      }, {
        loginMethod: 'mobile_app',
        userType: userType
      });
    }

    // Build user response object
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      userType: userType,
      image: user.image || null
    };

    // For agents and socialmediaperson, add location and department fields
    if (userType === 'agents' || userType === 'socialmediaperson') {
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

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: userResponse,
      expiresIn: 3600 // 1 hour in seconds
    }, { status: 200 });

  } catch (error) {
    console.error('Mobile app login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    // Release database client if it was created
    if (client && typeof client.release === 'function') {
      try {
        client.release();
      } catch (releaseError) {
        console.error('Error releasing database client:', releaseError);
      }
    }
  }
}

/**
 * GET /api/mobile/auth/verify
 * Verify if API key is valid (for testing)
 * 
 * Headers:
 *   Authorization: Bearer <MOBILE_APP_API_KEY>
 */
export async function GET(req) {
  const apiKeyError = validateMobileApiToken(req);
  if (apiKeyError) {
    return apiKeyError;
  }

  return NextResponse.json({
    success: true,
    message: 'API key is valid',
    timestamp: new Date().toISOString()
  });
}

