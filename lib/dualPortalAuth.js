/**
 * Utility functions for managing Dual-Portal Access.
 * Allows specific users configured in .env (DUAL_PORTAL_USERS) to access
 * both Works Management Portal (WMP) and E-Filing System from any network.
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
 * Check if a given email, user object, or session belongs to a whitelisted dual-portal user.
 * @param {string|object} userOrEmail - Email string, user object, or session object
 * @returns {boolean} True if the user is authorized for dual-portal access
 */
export function isDualPortalUser(userOrEmail) {
    if (!userOrEmail) return false;

    let email = '';
    if (typeof userOrEmail === 'string') {
        email = userOrEmail;
    } else if (typeof userOrEmail === 'object') {
        // Handle session object: session.user.email
        email = userOrEmail.email || userOrEmail.user?.email || '';
    }

    if (!email || typeof email !== 'string') return false;

    const dualUsers = getDualPortalUsers();
    return dualUsers.includes(email.trim().toLowerCase());
}

/**
 * Check if the user is authorized to access a given portal from the current network.
 * @param {object} params
 * @param {string} params.portal - 'wmp' | 'efiling'
 * @param {object|string} params.user - User object or email
 * @param {boolean} params.isInternalNetwork - Whether the request originates from internal IP
 * @returns {boolean} True if access is permitted
 */
export function canAccessPortal({ portal, user, isInternalNetwork }) {
    // If the user is whitelisted for dual portal access, allow access to both portals from any network
    if (isDualPortalUser(user)) {
        return true;
    }

    // For E-Filing portal, non-whitelisted users must be on the internal network
    if (portal === 'efiling') {
        return Boolean(isInternalNetwork);
    }

    // For WMP portal, access depends on standard authentication/roles
    return true;
}
