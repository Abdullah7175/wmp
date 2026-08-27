/**
 * Convert an IPv4 address string to a 32-bit unsigned integer
 */
function ipToLong(ip) {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return null;
    return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

/**
 * Check if a client IP address matches a given rule
 * Supported rule formats:
 * 1. Exact match: "192.168.50.2", "::1", "127.0.0.1"
 * 2. CIDR notation: "172.16.10.0/24", "10.0.0.0/8"
 * 3. Hyphen range: "192.168.20.0-192.168.20.20"
 * 4. Wildcard notation: "192.168.50.*"
 */
export function ipMatchesRule(ip, rule) {
    if (!ip || !rule || typeof rule !== 'string') return false;

    rule = rule.trim();
    ip = ip.trim();

    // Normalize IPv6 addresses (remove spaces)
    rule = rule.replace(/:\s+/g, ':');
    ip = ip.replace(/:\s+/g, ':');

    // 1. Exact Match (handles IPv4 and IPv6)
    if (ip.toLowerCase() === rule.toLowerCase()) {
        return true;
    }

    // 2. CIDR Notation (e.g. 172.16.10.0/24)
    if (rule.includes('/') && !rule.startsWith('[')) {
        const [subnet, bits] = rule.split('/').map(s => s.trim());
        const maskBits = parseInt(bits, 10);
        if (isNaN(maskBits) || maskBits < 0 || maskBits > 32) {
            console.warn(`Invalid CIDR notation: ${rule}`);
            return false;
        }
        const ipLong = ipToLong(ip);
        const subnetLong = ipToLong(subnet);
        if (ipLong === null || subnetLong === null) {
            return false;
        }
        const mask = maskBits === 0 ? 0 : (~0 << (32 - maskBits)) >>> 0;
        return (ipLong & mask) === (subnetLong & mask);
    }

    // 3. Hyphen Range (e.g. 192.168.20.0-192.168.20.20)
    if (rule.includes('-') && !rule.startsWith('-') && !rule.includes(':')) {
        const parts = rule.split('-').map(p => p.trim()).filter(Boolean);
        if (parts.length === 2) {
            const startIp = parts[0];
            const endIp = parts[1];
            const ipLong = ipToLong(ip);
            const startLong = ipToLong(startIp);
            const endLong = ipToLong(endIp);
            if (ipLong === null || startLong === null || endLong === null) {
                return false;
            }
            return ipLong >= startLong && ipLong <= endLong;
        }
    }

    // 4. Wildcard Notation (e.g. 192.168.50.*)
    if (rule.includes('*')) {
        const regexPattern = '^' + rule
            .replace(/\./g, '\\.')
            .replace(/\*/g, '([0-9]{1,3})') + '$';
        const regex = new RegExp(regexPattern);
        return regex.test(ip);
    }

    return false;
}

/**
 * Extract the client's real IP address from request headers or socket
 */
export function getClientIp(request) {
    if (!request) return '';

    // Handle NextRequest, Standard Request, or Express-like req
    const getHeader = (name) => {
        if (request.headers?.get) {
            return request.headers.get(name);
        }
        if (request.headers) {
            return request.headers[name] || request.headers[name.toLowerCase()];
        }
        return null;
    };

    const xForwardedFor = getHeader('x-forwarded-for');
    const xRealIp = getHeader('x-real-ip');
    const cfConnectingIp = getHeader('cf-connecting-ip');

    const rawIp =
        (xForwardedFor ? xForwardedFor.split(',')[0].trim() : null) ||
        xRealIp?.trim() ||
        cfConnectingIp?.trim() ||
        request.ip ||
        request.socket?.remoteAddress ||
        '';

    // Remove IPv6-mapped IPv4 prefix (e.g., ::ffff:192.168.1.1)
    let cleanIp = rawIp.replace(/^::ffff:/, '').trim();

    // Map localhost strings
    if (cleanIp === 'localhost') {
        cleanIp = '127.0.0.1';
    }

    return cleanIp;
}

/**
 * Check if the request originates from an authorized internal network for E-Filing
 */
export function isInternalNetwork(request) {
    try {
        const cleanIp = getClientIp(request);

        if (!cleanIp) {
            console.warn('No IP address found in request');
            return false;
        }

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

        // Check IPv6 loopback
        if (cleanIp === '::1' && (allowedRanges.includes('::1') || allowedRanges.includes('127.0.0.1'))) {
            return true;
        }

        // Check IPv4 loopback
        if (cleanIp === '127.0.0.1' && (allowedRanges.includes('127.0.0.1') || allowedRanges.includes('::1'))) {
            return true;
        }

        // Check against all configured rules
        const isAllowed = allowedRanges.some(rule => ipMatchesRule(cleanIp, rule));

        if (!isAllowed) {
            console.warn(`[Network Validation] Client IP ${cleanIp} rejected (not in allowed EFILING_ALLOWED_IPS)`);
        } else {
            console.log(`[Network Validation] Client IP ${cleanIp} matched allowed E-Filing network`);
        }

        return isAllowed;
    } catch (error) {
        console.error('Network validation error:', error);
        return false;
    }
}
