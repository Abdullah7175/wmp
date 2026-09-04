import { NextResponse } from 'next/server';
import { isInternalNetwork } from './validateNetwork';
import { isDualPortalUser } from '@/lib/dualPortalAuth';
import { getToken } from 'next-auth/jwt';

export async function efilingAuthMiddleware(request) {
    try {
        const pathname = request.nextUrl.pathname;
        const isInternal = isInternalNetwork(request);

        // Check for session cookies (Edge runtime compatible - supports both HTTP & HTTPS)
        const sessionCookie = request.cookies.get('next-auth.session-token') ||
            request.cookies.get('__Secure-next-auth.session-token') ||
            request.cookies.get('authjs.session-token') ||
            request.cookies.get('__Secure-authjs.session-token');

        const hasSession = Boolean(sessionCookie);

        const isDev = process.env.NODE_ENV === 'development';
        const withSecurityHeaders = (res) => {
            try {
                if (pathname.startsWith('/api/')) {
                    return res;
                }

                // For non-API routes, set full security headers
                res.headers.set('X-Frame-Options', 'DENY');
                res.headers.set('X-Content-Type-Options', 'nosniff');
                res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
                res.headers.set('Permissions-Policy', 'camera=(), geolocation=(), microphone=()');
                res.headers.delete('X-Powered-By');

                const scriptSrc = isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self' 'unsafe-inline'";
                const origin = request.headers.get('x-forwarded-proto') && request.headers.get('x-forwarded-host')
                    ? `${request.headers.get('x-forwarded-proto')}://${request.headers.get('x-forwarded-host')}`
                    : request.nextUrl.origin;
                const connectSrc = `connect-src 'self' ws: ${origin} ${origin}`;
                const csp = `default-src 'self'; ${scriptSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https: http:; media-src 'self' blob: https: http:; ${connectSrc}; frame-src 'self' blob:; frame-ancestors 'none'; object-src 'none'`;
                res.headers.set('Content-Security-Policy', csp);

                if (request.method === 'POST') {
                    const reqOrigin = request.headers.get('origin');
                    const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
                    const forwardedProto = request.headers.get('x-forwarded-proto') || (request.nextUrl.protocol.replace(':', ''));
                    const referer = request.headers.get('referer');

                    if (reqOrigin) {
                        res.headers.set('origin', reqOrigin);
                        request.headers.set('origin', reqOrigin);
                    } else if (forwardedProto && forwardedHost) {
                        const reconstructedOrigin = `${forwardedProto}://${forwardedHost}`;
                        res.headers.set('origin', reconstructedOrigin);
                        request.headers.set('origin', reconstructedOrigin);
                    } else if (referer) {
                        try {
                            const refererUrl = new URL(referer);
                            res.headers.set('origin', refererUrl.origin);
                            request.headers.set('origin', refererUrl.origin);
                        } catch { }
                    } else if (request.nextUrl.origin) {
                        res.headers.set('origin', request.nextUrl.origin);
                        request.headers.set('origin', request.nextUrl.origin);
                    }
                }
            } catch (headerError) {
                console.error('Error setting security headers:', headerError);
            }
            return res;
        };

        // Redirect legacy /elogin to /login
        if (pathname === '/elogin') {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Unauthenticated requests: 401 for API, redirect to /login for pages
        if (!hasSession) {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json(
                    { error: 'Unauthorized: E-Filing session required', code: 'UNAUTHORIZED' },
                    { status: 401 }
                );
            }
            return withSecurityHeaders(NextResponse.redirect(new URL('/login', request.url)));
        }

        // Authenticated sessions off-network must be configured in DUAL_PORTAL_USERS
        if (!isInternal) {
            let isDual = false;
            try {
                const token = await getToken({
                    req: request,
                    secret: process.env.NEXTAUTH_SECRET,
                    cookieName: sessionCookie?.name,
                });
                const email = token?.email || token?.user?.email;
                isDual = Boolean(isDualPortalUser(email));
            } catch (tokenErr) {
                console.warn('[efilingAuthMiddleware] Could not decode session token off-network:', tokenErr.message);
            }

            if (!isDual) {
                if (pathname.startsWith('/api/')) {
                    return NextResponse.json(
                        { error: 'Access Denied: E-Filing is restricted to authorized office networks.', code: 'IP_NOT_ALLOWED' },
                        { status: 403 }
                    );
                }
                return withSecurityHeaders(NextResponse.redirect(new URL('/login', request.url)));
            }
        }

        // Authenticated session with authorized network or dual-portal status
        return withSecurityHeaders(NextResponse.next());
    } catch (error) {
        console.error('Error in efilingAuthMiddleware:', error);
        return NextResponse.next();
    }
}

