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

    const client = await connectToDatabase();

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

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        userType: userType,
        image: user.image || null
      },
      expiresIn: 3600 // 1 hour in seconds
    }, { status: 200 });

  } catch (error) {
    console.error('Mobile app login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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

