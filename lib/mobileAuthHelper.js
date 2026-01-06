/**
 * Mobile App Authentication Helper
 * Extracts and validates JWT tokens from X-User-Token header
 */

import { verify } from 'jsonwebtoken';
import { NextResponse } from 'next/server';

/**
 * Extract and verify JWT token from X-User-Token header
 * @param {Request} request - The incoming request
 * @returns {Object|null} - Returns decoded token or null if invalid
 */
export function getMobileUserToken(request) {
  const token = request.headers.get('X-User-Token');
  
  if (!token) {
    return null;
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    
    // Verify it's a mobile app token
    if (decoded.source !== 'mobile_app') {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return null;
  }
}

/**
 * Middleware to require mobile user authentication
 * @param {Request} request - The incoming request
 * @returns {Object|null} - Returns error response if invalid, or decoded token if valid
 */
export function requireMobileUserAuth(request) {
  const decoded = getMobileUserToken(request);
  
  if (!decoded) {
    return NextResponse.json(
      { error: 'Unauthorized - Invalid or missing token' },
      { status: 401 }
    );
  }
  
  return decoded;
}
