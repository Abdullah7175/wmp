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
 * Check if a given email, user object, or session belongs to a configured dual-portal user in .env.
 * ONLY emails explicitly defined in DUAL_PORTAL_USERS in .env have remote dual-portal access.
 * @param {string|object} userOrEmail - Email string, user object, or session object
 * @returns {boolean} True if the user's email is listed in DUAL_PORTAL_USERS in .env
 */
export function isDualPortalUser(userOrEmail) {
    if (!userOrEmail) return false;

    let email = '';
    if (typeof userOrEmail === 'string') {
        email = userOrEmail;
    } else if (typeof userOrEmail === 'object') {
        email = userOrEmail.email || userOrEmail.user?.email || '';
    }

    if (!email || typeof email !== 'string') return false;

    const dualUsers = getDualPortalUsers();
    return dualUsers.includes(email.trim().toLowerCase());
}

/**
 * Check if the user is authorized to access a given portal from the current network.
 * - ONLY users explicitly in DUAL_PORTAL_USERS in .env can access E-Filing from external networks.
 * - All other users (including Super Admin) can ONLY access E-Filing from allowed internal networks.
 * - Works Management Portal (WMP) is publicly accessible to all authorized accounts.
 * 
 * @param {object} params
 * @param {string} params.portal - 'wmp' | 'efiling'
 * @param {object|string} params.user - User object or email
 * @param {boolean} params.isInternalNetwork - Whether the request originates from allowed IP
 * @returns {boolean} True if access is permitted
 */
export function canAccessPortal({ portal, user, isInternalNetwork }) {
    if (portal === 'efiling') {
        const isDual = isDualPortalUser(user);
        // Only users explicitly in DUAL_PORTAL_USERS can access e-filing from external networks
        return Boolean(isInternalNetwork || isDual);
    }

    // For Works Management Portal (WMP), access is publicly open to all authorized users
    return true;
}

/**
 * Check if the Dual Portal Selection Modal / switchers should be shown.
 * - Users in DUAL_PORTAL_USERS can see dual-portal UI on ANY network.
 * - Super Admin (Role 1) can see dual-portal UI ONLY when on an allowed office network.
 */
export function shouldShowDualPortalUI({ user, isInternalNetwork }) {
    const isDual = isDualPortalUser(user);
    if (isDual) return true;

    const role = typeof user === 'object' ? parseInt(user.role || user.user?.role || 0) : 0;
    return Boolean(isInternalNetwork && role === 1);
}

