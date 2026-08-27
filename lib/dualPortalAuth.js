/**
 * Utility functions for managing Dual-Portal Access.
 * Controls access and visibility between Works Management Portal (WMP) and E-Filing System.
 * E-Filing System is strictly restricted to whitelisted IP addresses / ranges in .env.
 */

/**
 * Get list of configured dual-portal user emails from environment variables.
 * @returns {string[]} Array of lowercase trimmed emails.
 */
export function getDualPortalUsers() {
    const raw = process.env.DUAL_PORTAL_USERS || '';
    return raw
        .split(',')
        .map(email => email.trim().toLowerCase())
        .filter(Boolean);
}

/**
 * Check if a given email, user object, or session belongs to a configured dual-portal user or admin.
 * @param {string|object} userOrEmail - Email string, user object, or session object
 * @returns {boolean} True if the user has dual-portal account credentials
 */
export function isDualPortalUser(userOrEmail) {
    if (!userOrEmail) return false;

    let email = '';
    let role = null;

    if (typeof userOrEmail === 'string') {
        email = userOrEmail;
    } else if (typeof userOrEmail === 'object') {
        // Handle session object or user object
        email = userOrEmail.email || userOrEmail.user?.email || '';
        role = userOrEmail.role ?? userOrEmail.user?.role ?? null;
    }

    // Role 1 (Super Admin) is always a dual-portal authorized user
    if (parseInt(role) === 1) {
        return true;
    }

    if (!email || typeof email !== 'string') return false;

    const dualUsers = getDualPortalUsers();
    return dualUsers.includes(email.trim().toLowerCase());
}

/**
 * Check if the user is authorized to access a given portal from the current network.
 * E-Filing portal strictly requires request to originate from an allowed IP range.
 * WMP portal is publicly accessible.
 * 
 * @param {object} params
 * @param {string} params.portal - 'wmp' | 'efiling'
 * @param {object|string} params.user - User object or email
 * @param {boolean} params.isInternalNetwork - Whether the request originates from allowed IP
 * @returns {boolean} True if access is permitted
 */
export function canAccessPortal({ portal, user, isInternalNetwork }) {
    // For E-Filing portal, ALL users (including dual-portal and admins) must be on allowed IP
    if (portal === 'efiling') {
        return Boolean(isInternalNetwork);
    }

    // For Works Management Portal (WMP), access is publicly open to all authenticated users
    return true;
}

/**
 * Check if the Dual Portal Selection Modal / switchers should be shown.
 * Only shown if the user has dual portal access AND is on an allowed IP network.
 */
export function shouldShowDualPortalUI({ user, isInternalNetwork }) {
    return Boolean(isInternalNetwork) && isDualPortalUser(user);
}

