export function isInternalNetwork(request) {
    try {
        // Get client IP (works behind proxy, nginx, cloudflare)
        const ip =
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.ip ||
            '';

        if (!ip) return false;
        console.log('Client IP:', ip);

        const allowedRanges =process.env.EFILING_ALLOWED_IPS?.split(',').map(ip => ip.trim()) || [];

        return allowedRanges.some(prefix => ip.startsWith(prefix));
    } catch (error) {
        console.error('Network validation error:', error);
        return false;
    }
}
