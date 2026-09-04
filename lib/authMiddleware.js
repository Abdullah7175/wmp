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
 * @param {number} userId - The user ID from users table
 * @param {boolean} isAdmin - Whether the user is an admin
 * @returns {Promise<boolean>} - True if user can access the file
 */
/**
 * Check if user is only a CC recipient on the file (not creator/assignee and cannot mark).
 * CC-only users may view the file but must not edit, mark, sign, or mutate it.
 * If the file is marked to them, or they are allowed to mark it, CC rules do NOT apply.
 */
export async function isCcOnlyOnFile(client, fileId, efilingUserId, fileRow = null) {
    if (!efilingUserId || !fileId) return false;

    let file = fileRow;
    if (!file) {
        const result = await client.query(
            `SELECT created_by, assigned_to FROM efiling_files WHERE id = $1`,
            [fileId]
        );
        if (result.rows.length === 0) return false;
        file = result.rows[0];
    }

    // Creator / current assignee: full rights, ignore any CC rows
    if (Number(file.created_by) === Number(efilingUserId)) return false;
    if (Number(file.assigned_to) === Number(efilingUserId)) return false;

    // If this user can mark/forward the file, CC view-only must not apply
    try {
        const { canMarkFile } = await import('@/lib/efilingTeamManager');
        if (await canMarkFile(client, fileId, efilingUserId)) {
            return false;
        }
    } catch (markCheckError) {
        console.warn('[isCcOnlyOnFile] canMarkFile check failed:', markCheckError.message);
    }

    try {
        const ccCheck = await client.query(
            `SELECT 1 FROM efiling_file_cc WHERE file_id = $1 AND cc_user_id = $2 LIMIT 1`,
            [fileId, efilingUserId]
        );
        return ccCheck.rows.length > 0;
    } catch (error) {
        if (error.code !== '42P01') {
            console.warn('[isCcOnlyOnFile] check failed:', error.message);
        }
        return false;
    }
}

/**
 * Block write/mutation APIs for CC-only viewers.
 * Returns a NextResponse to send, or null if the user may proceed.
 */
export async function rejectCcOnlyMutation(client, fileId, systemUserId, isAdmin = false) {
    if (isAdmin || !systemUserId || !fileId) return null;

    try {
        const efilingUserResult = await client.query(
            `SELECT id FROM efiling_users WHERE user_id = $1 AND is_active = true`,
            [systemUserId]
        );
        if (efilingUserResult.rows.length === 0) return null;

        const efilingUserId = efilingUserResult.rows[0].id;
        const ccOnly = await isCcOnlyOnFile(client, fileId, efilingUserId);
        if (!ccOnly) return null;

        const { NextResponse } = await import('next/server');
        return NextResponse.json({
            error: 'You are CC\'d on this file and have view-only access. You cannot change this file.',
            code: 'CC_VIEW_ONLY'
        }, { status: 403 });
    } catch (error) {
        console.warn('[rejectCcOnlyMutation] failed:', error.message);
        return null;
    }
}

export async function checkFileAccess(client, fileId, userId, isAdmin = false) {
    if (isAdmin) return true;
    
    try {
        // First, get the e-filing user ID for this user
        const efilingUserResult = await client.query(
            `SELECT id FROM efiling_users WHERE user_id = $1 AND is_active = true`,
            [userId]
        );
        
        // If user is not an e-filing user, deny access (unless admin, which is already checked)
        if (efilingUserResult.rows.length === 0) {
            console.log(`[checkFileAccess] User ${userId} is not an e-filing user, denying access to file ${fileId}`);
            return false;
        }
        
        const efilingUserId = efilingUserResult.rows[0].id;
        
        // Get file details - created_by and assigned_to reference efiling_users.id
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
        
        // Check if user created the file or is assigned to it
        // Both created_by and assigned_to reference efiling_users.id
        if (file.created_by === efilingUserId || file.assigned_to === efilingUserId) {
            console.log(`[checkFileAccess] User ${userId} (efiling: ${efilingUserId}) has access to file ${fileId} - created_by: ${file.created_by}, assigned_to: ${file.assigned_to}`);
            return true;
        }

        // Check if user was carbon-copied (CC) on this file
        try {
            const ccCheck = await client.query(
                `SELECT 1 FROM efiling_file_cc WHERE file_id = $1 AND cc_user_id = $2 LIMIT 1`,
                [fileId, efilingUserId]
            );
            if (ccCheck.rows.length > 0) {
                console.log(`[checkFileAccess] User ${userId} (efiling: ${efilingUserId}) has CC access to file ${fileId}`);
                return true;
            }
        } catch (ccError) {
            // Table may not exist yet on older DBs — ignore and continue
            if (ccError.code !== '42P01') {
                console.warn('[checkFileAccess] CC check failed:', ccError.message);
            }
        }

        // Check if user can mark/forward the file via workflow
        try {
            const { canMarkFile } = await import('@/lib/efilingTeamManager');
            if (await canMarkFile(client, fileId, efilingUserId)) {
                console.log(`[checkFileAccess] User ${userId} (efiling: ${efilingUserId}) has workflow marking access to file ${fileId}`);
                return true;
            }
        } catch (markErr) {
            // Non-fatal if team manager check fails
        }
        
        // SECURITY: Department-wide file access is strictly opt-in (file.department_visible === true)
        // Silent department-wide access is disabled to protect need-to-know file confidentiality
        if (file.department_id && file.department_visible === true) {
            const deptCheck = await client.query(
                `SELECT eu.id 
                 FROM efiling_users eu
                 WHERE eu.user_id = $1 
                 AND eu.department_id = $2 
                 AND eu.is_active = true`,
                [userId, file.department_id]
            );
            if (deptCheck.rows.length > 0) {
                console.log(`[checkFileAccess] User ${userId} has explicit opt-in department access to file ${fileId} (department: ${file.department_id})`);
                return true;
            }
        }
        
        console.log(`[checkFileAccess] User ${userId} (efiling: ${efilingUserId}) denied access to file ${fileId} - created_by: ${file.created_by}, assigned_to: ${file.assigned_to}, department: ${file.department_id}`);
        return false;
    } catch (error) {
        console.error('Error checking file access:', error);
        return false;
    }
}

