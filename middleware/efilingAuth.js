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
            const connectSrc = isDev ? "connect-src 'self' ws: http://localhost:3000 ws: http://119.30.113.18:3000" : "connect-src 'self'";
            const csp = `default-src 'self'; ${scriptSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; ${connectSrc}; frame-ancestors 'none'; object-src 'none'`;
            res.headers.set('Content-Security-Policy', csp);
            
            // Ensure origin header is set for Server Actions (POST requests)
            if (request.method === 'POST') {
                const origin = request.headers.get('origin');
                const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
                const forwardedProto = request.headers.get('x-forwarded-proto') || (request.nextUrl.protocol.replace(':', ''));
                const referer = request.headers.get('referer');
                
                if (origin) {
                    res.headers.set('origin', origin);
                    request.headers.set('origin', origin);
                } else if (forwardedProto && forwardedHost) {
                    const reconstructedOrigin = `${forwardedProto}://${forwardedHost}`;
                    res.headers.set('origin', reconstructedOrigin);
                    request.headers.set('origin', reconstructedOrigin);
                } else if (referer) {
                    try {
                        const refererUrl = new URL(referer);
                        res.headers.set('origin', refererUrl.origin);
                        request.headers.set('origin', refererUrl.origin);
                    } catch {}
                } else if (request.nextUrl.origin) {
                    res.headers.set('origin', request.nextUrl.origin);
                    request.headers.set('origin', request.nextUrl.origin);
                }
            }
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
    // But allow POST requests and Server Actions to pass through
    // (they might be part of the authentication flow or form submissions)
    if (!token) {
        // Allow POST requests to pass through (might be Server Actions or form submissions)
        if (request.method === 'POST') {
            return withSecurityHeaders(NextResponse.next());
        }
        
        // Check if there's a referer from elogin (user just logged in)
        // Give a small grace period by checking for session cookie directly
        const sessionCookie = request.cookies.get(
            process.env.NODE_ENV === 'production' 
                ? '__Secure-next-auth.session-token' 
                : 'next-auth.session-token'
        );
        
        // If there's a session cookie but no token yet, it might be in the process of being set
        // Allow the request through but it will be checked again on the next request
        if (sessionCookie) {
            // Still redirect to login, but this should be rare
            // The session should be available by the time the redirect happens
            return withSecurityHeaders(NextResponse.redirect(new URL('/elogin', request.url)));
        }
        
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
