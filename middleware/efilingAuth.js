import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function efilingAuthMiddleware(request) {
    const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
    });

    // If no token, redirect to login
    if (!token) {
        return NextResponse.redirect(new URL('/elogin', request.url));
    }

    // Get user role from database
    try {
        const response = await fetch(`${process.env.NEXTAUTH_URL}/api/users/${token.id}`, {
            headers: {
                'Authorization': `Bearer ${token.accessToken}`,
            },
        });

        if (response.ok) {
            const userData = await response.json();
            const userRole = userData.role;
            const pathname = request.nextUrl.pathname;

            // Check if user is trying to access admin pages
            if (pathname.startsWith('/efiling') && !pathname.startsWith('/efilinguser')) {
                // Only allow role 1 (admin) to access admin pages
                if (userRole !== 1) {
                    // Redirect role 4 users to their proper portal
                    if (userRole === 4) {
                        return NextResponse.redirect(new URL('/efilinguser', request.url));
                    }
                    // For other roles, redirect to efilinguser as default
                    return NextResponse.redirect(new URL('/efilinguser', request.url));
                }
            }

            // Check if user is trying to access video archiving
            if (pathname.startsWith('/dashboard/videos') || pathname.startsWith('/agent/videos')) {
                // Only allow role 1 (admin) to access video archiving
                if (userRole !== 1) {
                    if (userRole === 4) {
                        return NextResponse.redirect(new URL('/efilinguser', request.url));
                    }
                    return NextResponse.redirect(new URL('/efilinguser', request.url));
                }
            }

            // Allow access to efilinguser pages for all authenticated users
            if (pathname.startsWith('/efilinguser')) {
                return NextResponse.next();
            }

            // Allow access to admin pages for role 1
            if (userRole === 1) {
                return NextResponse.next();
            }

            // Default redirect for other cases
            return NextResponse.redirect(new URL('/efilinguser', request.url));
        }
    } catch (error) {
        console.error('Error checking user role in middleware:', error);
        // On error, redirect to efilinguser as safe default
        return NextResponse.redirect(new URL('/efilinguser', request.url));
    }

    return NextResponse.next();
}
