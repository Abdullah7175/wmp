/**
 * Convert an IPv4 address string to a 32-bit integer
 */
function ipToLong(ip) {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return null;
    return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}


function ipMatchesRule(ip, rule) {
    if (!rule || typeof rule !== 'string') return false;

    rule = rule.trim();

    // --- CIDR notation (e.g. 192.168.50.0/24) ---
    if (rule.includes('/')) {
        const [subnet, bits] = rule.split('/').map(s => s.trim());
        const maskBits = parseInt(bits, 10);
        if (isNaN(maskBits) || maskBits < 0 || maskBits > 32) {
            console.warn(`Invalid CIDR notation: ${rule}`);
            return false;
        }
        const ipLong = ipToLong(ip);
        const subnetLong = ipToLong(subnet);
        if (ipLong === null || subnetLong === null) {
            console.warn(`Invalid IP in CIDR rule: ${rule}`);
            return false;
        }
        const mask = maskBits === 0 ? 0 : (~0 << (32 - maskBits)) >>> 0;
        return (ipLong & mask) === (subnetLong & mask);
    }

    // --- Hyphen range (e.g. 192.168.50.1-192.168.50.254) ---
    if (rule.includes('-') && !rule.startsWith('-')) {
        // Split carefully to handle ranges
        const parts = rule.split('-').filter(p => p.trim());
        if (parts.length === 2) {
            const startIp = parts[0].trim();
            const endIp = parts[1].trim();
            const ipLong = ipToLong(ip);
            const startLong = ipToLong(startIp);
            const endLong = ipToLong(endIp);
            if (ipLong === null || startLong === null || endLong === null) {
                console.warn(`Invalid IP in range rule: ${rule}`);
                return false;
            }
            return ipLong >= startLong && ipLong <= endLong;
        }
    }

    // --- Wildcard notation (e.g. 192.168.50.*) ---
    if (rule.includes('*')) {
        const regex = new RegExp('^' + rule.replace(/\./g, '\\.').replace(/\*/g, '[0-9]{1,3}') + '$');
        return regex.test(ip);
    }

    // --- Exact match or prefix match ---
    return ip === rule || ip.startsWith(rule);
}

export function isInternalNetwork(request) {
    try {
        // Get client IP (works behind proxy, nginx, cloudflare)
        const xForwardedFor = request.headers.get('x-forwarded-for');
        const ip =
            xForwardedFor?.split(',')[0]?.trim() ||
            request.headers.get('x-real-ip')?.trim() ||
            request.socket?.remoteAddress ||
            request.ip ||
            '';

        if (!ip) {
            console.warn('No IP address found in request');
            return false;
        }

        // Remove IPv6 prefix if present (e.g., ::ffff:192.168.1.1)
        const cleanIp = ip.replace('::ffff:', '');
        console.log('Client IP:', cleanIp, '(original:', ip + ')');

        const envAllowedIPs = process.env.EFILING_ALLOWED_IPS?.trim();
        if (!envAllowedIPs) {
            console.warn('EFILING_ALLOWED_IPS environment variable not set');
            return false;
        }

        const allowedRanges = envAllowedIPs
            .split(',')
            .map((entry) => entry.trim())
            .filter(Boolean);

        if (allowedRanges.length === 0) {
            console.warn('No allowed IP ranges configured');
            return false;
        }

        console.log('Allowed IP ranges:', allowedRanges);

        // Check IPv6 loopback first
        if (cleanIp === '::1' && allowedRanges.includes('::1')) {
            console.log('IPv6 loopback allowed');
            return true;
        }

        // Check IPv4 loopback
        if (cleanIp === '127.0.0.1' && allowedRanges.includes('127.0.0.1')) {
            console.log('IPv4 loopback allowed');
            return true;
        }

        // Check all ranges
        const isAllowed = allowedRanges.some(rule => {
            const matches = ipMatchesRule(cleanIp, rule);
            if (matches) {
                console.log(`IP ${cleanIp} matched rule: ${rule}`);
            }
            return matches;
        });

        if (!isAllowed) {
            console.warn(`IP ${cleanIp} not in allowed ranges:`, allowedRanges);
        }

        return isAllowed;
    } catch (error) {
        console.error('Network validation error:', error);
        return false;
    }
}
