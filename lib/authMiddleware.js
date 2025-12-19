// lib/authMiddleware.js
// Reusable authentication middleware for API routes
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

/**
 * Require authentication for API routes
 * @param {Request} request - The incoming request
 * @returns {Promise<{session: any, user: any} | NextResponse>} - Session and user if authenticated, or error response
 */
export async function requireAuth(request) {
    const session = await auth();
    
    if (!session?.user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }
    
    return { session, user: session.user };
}

/**
 * Require admin role
 * @param {Request} request - The incoming request
 * @returns {Promise<{session: any, user: any} | NextResponse>} - Session and user if admin, or error response
 */
export async function requireAdmin(request) {
    const authResult = await requireAuth(request);
    
    if (authResult instanceof NextResponse) {
        return authResult; // Error response
    }
    
    const { user } = authResult;
    const isAdmin = [1, 2].includes(parseInt(user.role));
    
    if (!isAdmin) {
        return NextResponse.json(
            { error: 'Forbidden - Admin access required' },
            { status: 403 }
        );
    }
    
    return authResult;
}

/**
 * Check if user owns a resource or is admin
 * @param {number|string} userId - The user ID from session
 * @param {number|string} resourceUserId - The user ID who owns the resource
 * @param {boolean} isAdmin - Whether the user is an admin
 * @returns {boolean} - True if user can access the resource
 */
export function checkOwnership(userId, resourceUserId, isAdmin = false) {
    if (isAdmin) return true;
    return parseInt(userId) === parseInt(resourceUserId);
}

/**
 * Check if user can access a file (for e-filing system)
 * @param {any} client - Database client
 * @param {number} fileId - The file ID
 * @param {number} userId - The user ID
 * @param {boolean} isAdmin - Whether the user is an admin
 * @returns {Promise<boolean>} - True if user can access the file
 */
export async function checkFileAccess(client, fileId, userId, isAdmin = false) {
    if (isAdmin) return true;
    
    try {
        const result = await client.query(
            `SELECT created_by, assigned_to, department_id 
             FROM efiling_files 
             WHERE id = $1`,
            [fileId]
        );
        
        if (result.rows.length === 0) {
            return false;
        }
        
        const file = result.rows[0];
        // Check if user created, is assigned, or has department access
        if (file.created_by === userId || file.assigned_to === userId) {
            return true;
        }
        
        // Check department access if needed
        // This is a simplified check - you may need to enhance based on your permission system
        return false;
    } catch (error) {
        console.error('Error checking file access:', error);
        return false;
    }
}

