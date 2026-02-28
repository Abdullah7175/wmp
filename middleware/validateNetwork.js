/**
 * Convert an IPv4 address string to a 32-bit integer
 */
function ipToLong(ip) {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return null;
    return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

/**
 * Check if an IP matches a given rule.
 * Supported formats:
 *   - Exact IP:       192.168.50.2
 *   - CIDR range:     192.168.50.0/24
 *   - Wildcard:       192.168.50.*
 *   - Hyphen range:   192.168.50.1-192.168.50.254
 *   - Prefix match:   192.168.  (fallback)
 */
function ipMatchesRule(ip, rule) {
    // --- CIDR notation (e.g. 192.168.50.0/24) ---
    if (rule.includes('/')) {
        const [subnet, bits] = rule.split('/');
        const maskBits = parseInt(bits, 10);
        if (isNaN(maskBits) || maskBits < 0 || maskBits > 32) return false;
        const ipLong = ipToLong(ip);
        const subnetLong = ipToLong(subnet);
        if (ipLong === null || subnetLong === null) return false;
        const mask = maskBits === 0 ? 0 : (~0 << (32 - maskBits)) >>> 0;
        return (ipLong & mask) === (subnetLong & mask);
    }

    // --- Hyphen range (e.g. 192.168.50.1-192.168.50.254) ---
    if (rule.includes('-')) {
        const [startIp, endIp] = rule.split('-').map(s => s.trim());
        const ipLong = ipToLong(ip);
        const startLong = ipToLong(startIp);
        const endLong = ipToLong(endIp);
        if (ipLong === null || startLong === null || endLong === null) return false;
        return ipLong >= startLong && ipLong <= endLong;
    }

    // --- Wildcard notation (e.g. 192.168.50.*) ---
    if (rule.includes('*')) {
        const regex = new RegExp('^' + rule.replace(/\./g, '\\.').replace(/\*/g, '\\d{1,3}') + '$');
        return regex.test(ip);
    }

    // --- Exact match or prefix match ---
    return ip === rule || ip.startsWith(rule);
}

export function isInternalNetwork(request) {
    try {
        // Get client IP (works behind proxy, nginx, cloudflare)
        const ip =
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.ip ||
            '';

        if (!ip) return false;
        console.log('Client IP:', ip);

        const allowedRanges = (process.env.EFILING_ALLOWED_IPS?.split(',')
            .map((entry) => entry.trim())
            .filter(Boolean)) || [];

        // IPv6 loopback / localhost — always allow if listed
        if (ip === '::1' && allowedRanges.includes('::1')) return true;

        return allowedRanges.some(rule => ipMatchesRule(ip, rule));
    } catch (error) {
        console.error('Network validation error:', error);
        return false;
    }
}
