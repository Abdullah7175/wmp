/**
 * Helper functions for e-filing role detection and checks
 */

/**
 * Check if user is an external user (ADLFA or CON/Consultant)
 * @param {string} roleCode - User's role code
 * @returns {boolean} True if user is ADLFA or CON
 */
export function isExternalUser(roleCode) {
    if (!roleCode) return false;
    const code = roleCode.toUpperCase();
    return code === 'ADLFA' || 
           code === 'CON' || 
           code.startsWith('CON_') ||
           code === 'CONSULTANT' ||
           code.startsWith('CONSULTANT_');
}

/**
 * Check if user is Consultant or ADLFA
 * @param {string} roleCode - User's role code
 * @returns {boolean} True if user is CON or ADLFA
 */
export function isConsultantOrADLFA(roleCode) {
    return isExternalUser(roleCode);
}

/**
 * Check if user can create files (not external users)
 * @param {string} roleCode - User's role code
 * @returns {boolean} True if user can create files
 */
export function canCreateFiles(roleCode) {
    return !isExternalUser(roleCode);
}

/**
 * Check if user can access dashboard (not external users)
 * @param {string} roleCode - User's role code
 * @returns {boolean} True if user can access dashboard
 */
export function canAccessDashboard(roleCode) {
    return !isExternalUser(roleCode);
}
