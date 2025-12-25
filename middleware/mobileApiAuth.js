/**
 * Mobile App API Authentication Middleware
 * 
 * Validates API tokens from mobile app requests
 * Tokens are stored in environment variables
 */

import { NextResponse } from 'next/server';

/**
 * Validate mobile app API token from request headers
 * 
 * @param {Request} request - The incoming request
 * @returns {Object|null} - Returns null if valid, or error response if invalid
 */
export function validateMobileApiToken(request) {
  // Get API key from environment variables
  const validApiKeys = [
    process.env.MOBILE_APP_API_KEY,
    process.env.MOBILE_APP_AGENT_API_KEY,
    process.env.MOBILE_APP_SMAGENT_API_KEY,
  ].filter(Boolean); // Remove undefined/null values

  if (validApiKeys.length === 0) {
    console.error('⚠️  No mobile app API keys configured in environment variables');
    return NextResponse.json(
      { error: 'API authentication not configured' },
      { status: 500 }
    );
  }

  // Get token from Authorization header
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return NextResponse.json(
      { error: 'Unauthorized - Missing Authorization header' },
      { status: 401 }
    );
  }

  // Extract token from "Bearer <token>" format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return NextResponse.json(
      { error: 'Unauthorized - Invalid Authorization header format. Expected: Bearer <token>' },
      { status: 401 }
    );
  }

  const token = parts[1];

  // Validate token
  if (!validApiKeys.includes(token)) {
    // Log failed attempt (for security monitoring)
    console.warn('⚠️  Invalid mobile app API token attempt:', {
      tokenPrefix: token.substring(0, 8) + '...',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: 'Unauthorized - Invalid API token' },
      { status: 401 }
    );
  }

  // Token is valid
  return null;
}

/**
 * Middleware function to protect API routes
 * Use this in your API route handlers
 * 
 * @example
 * export async function POST(request) {
 *   const authError = validateMobileApiToken(request);
 *   if (authError) return authError;
 *   
 *   // Your route logic here
 * }
 */
export function requireMobileApiAuth(request) {
  return validateMobileApiToken(request);
}

/**
 * Get user type from token (if using different tokens for different user types)
 * 
 * @param {Request} request - The incoming request
 * @returns {string|null} - Returns 'agent', 'socialmedia', or null
 */
export function getUserTypeFromToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  const token = parts[1];

  // Check which token was used
  if (token === process.env.MOBILE_APP_AGENT_API_KEY) {
    return 'agent';
  }
  
  if (token === process.env.MOBILE_APP_SMAGENT_API_KEY) {
    return 'socialmedia';
  }

  // Default token - user type will be determined from login
  return null;
}

