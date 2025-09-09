import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function efilingAuthMiddleware(request) {
    const pathname = request.nextUrl.pathname;
    const isDev = process.env.NODE_ENV === 'development';
    const withSecurityHeaders = (res) => {
        try {
            res.headers.set('X-Frame-Options', 'DENY');
            res.headers.set('X-Content-Type-Options', 'nosniff');
            res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
            res.headers.set('Permissions-Policy', 'camera=(), geolocation=(), microphone=()');
            const scriptSrc = isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self' 'unsafe-inline'";
            const connectSrc = isDev ? "connect-src 'self' ws: http://localhost:3000" : "connect-src 'self'";
            const csp = `default-src 'self'; ${scriptSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; ${connectSrc}; frame-ancestors 'none'; object-src 'none'`;
            res.headers.set('Content-Security-Policy', csp);
        } catch {}
        return res;
    };
    
    // Allow access to elogin page without authentication
    if (pathname === '/elogin') {
        return withSecurityHeaders(NextResponse.next());
    }
    
    const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
    });

    // If no token, redirect to login
    if (!token) {
        return withSecurityHeaders(NextResponse.redirect(new URL('/elogin', request.url)));
    }

    // Basic path-based routing without role checking in middleware
    if (pathname.startsWith('/efilinguser')) {
        // Admins should use e-filing admin, not efilinguser
        if (token?.user?.role === 1 || token?.user?.role === 2) {
            return withSecurityHeaders(NextResponse.redirect(new URL('/efiling', request.url)));
        }
        return withSecurityHeaders(NextResponse.next());
    }
    
    if (pathname.startsWith('/efiling')) {
        return withSecurityHeaders(NextResponse.next());
    }

    return withSecurityHeaders(NextResponse.next());
}
