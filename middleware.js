import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { efilingAuthMiddleware } from "./middleware/efilingAuth";

const PUBLIC_PATHS = ["/elogin", "/login", "/unauthorized", "/_next", "/api", "/favicon.ico", "/public"];

// Allowed roles for smagent
const smagentRolesA = [1, 2, 3, 6]; // CAMERA MAN, ASSISTANT, PHOTOGRAPHER, CONTENT CREATOR
const smagentRolesB = [4, 5]; // VIDEO EDITOR, MANAGER
const editorOnlyRoles = [4]; // VIDEO EDITOR only
// Allowed roles for dashboard
const dashboardRoles = [1, 2, 3];

// List of allowed dashboard paths (prefixes)
const dashboardAllowed = [
  "/dashboard",
  "/dashboard/districts",
  "/dashboard/districts/add",
  "/dashboard/districts/edit",
  "/dashboard/towns",
  "/dashboard/towns/add",
  "/dashboard/towns/edit",
  "/dashboard/subtowns",
  "/dashboard/complaints/types",
  "/dashboard/complaints/types/add",
  "/dashboard/complaints/types/edit",
  "/dashboard/complaints/sub-types",
  "/dashboard/complaints/sub-types/add",
  "/dashboard/complaints/sub-types/edit",
  "/dashboard/requests",
  "/dashboard/requests/new",
  "/dashboard/requests/performa",
  "/dashboard/videos",
  "/dashboard/videos/add",
  "/dashboard/uploads/videos",
  "/dashboard/videos/edit",
  "/dashboard/final-videos",
  "/dashboard/final-videos/add",
  "/dashboard/images",
  "/dashboard/images/add",
  "/dashboard/images/edit",
  "/dashboard/users",
  "/dashboard/users/add",
  "/dashboard/users/edit",
  "/dashboard/agents",
  "/dashboard/agents/add",
  "/dashboard/agents/edit",
  "/dashboard/socialmediaagent",
  "/dashboard/socialmediaagent/add",
  "/dashboard/socialmediaagent/edit",
  "/dashboard/user-actions",
  "/dashboard/user-actions/add",
  "/dashboard/user-actions/edit",
  "/dashboard/user-actions/delete",
  "/dashboard/ceo-users",
  "/dashboard/ceo-users/add",
  "/dashboard/ceo-users/edit",
  "/dashboard/ceo-users/delete",
  "/dashboard/before-images",
  "/dashboard/before-images/add",
  "/dashboard/reports"
];

const agentAllowed = [
  "/agent",
  "/agent/requests",
  "/agent/requests/new",
  "/agent/videos",
  "/agent/images",
  "/agent/before-images",
  "/agent/before-images/add"
];

const smagentAllowedA = [
  "/smagent",
  "/smagent/assigned-requests",
  "/smagent/videos/add",
  "/smagent/images/add",
  "/smagent/before-images",
  "/smagent/before-images/add"
];
const smagentAllowedB = [
  "/smagent",
  "/smagent/assigned-requests",
  "/smagent/final-videos",
  "/smagent/final-videos/add",
  "/smagent/final-videos/edit",
  "/smagent/final-videos/view",
  "/smagent/my-uploads",
  "/smagent/images/download",
  "/smagent/videos/download",
  "/smagent/images/add",
  "/smagent/videos/add",
  "/smagent/before-images",
  "/smagent/before-images/add"
];

// CEO allowed routes (role 5)
const ceoAllowed = [
  "/ceo",
  "/ceo/requests",
  "/ceo/approved",
  "/ceo/rejected",
  "/ceo/notifications"
];

// COO allowed routes (role 6)
const cooAllowed = [
  "/coo",
  "/coo/requests",
  "/coo/analytics",
  "/coo/profile"
];

function getDashboardForUser(token) {
  if (!token) return "/login";
  // Route CEO to CEO portal
  if (token.user?.role === 5 && token.user?.userType === "user") return "/ceo";
  // Route COO to COO portal
  if (token.user?.role === 6 && token.user?.userType === "user") return "/coo";
  // Route admins/managers directly to e-filing admin
  if (token.user?.role === 1 || token.user?.role === 2) return "/efiling";
  if (token.user?.userType === "agent") return "/agent";
  if (token.user?.userType === "socialmedia") return "/smagent";
  if (token.user?.userType === "user") return "/dashboard";
  return "/login";
}

function isAllowed(pathname, allowedList) {
  return allowedList.some((route) => {
    if (route === "/smagent") {
      // Only allow exact match for /smagent
      return pathname === "/smagent";
    }
    // For other routes, allow exact match or subpaths
    return pathname === route || pathname.startsWith(route + "/");
  });
}

// Helper function to set origin header for Server Actions
function setOriginHeader(req, response) {
    const forwardedHost = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const forwardedProto = req.headers.get('x-forwarded-proto') || (req.nextUrl.protocol.replace(':', ''));
    const origin = req.headers.get('origin');
    const referer = req.headers.get('referer');
    
    // Preserve forwarded headers
    if (req.headers.get('x-forwarded-host')) {
        response.headers.set('x-forwarded-host', req.headers.get('x-forwarded-host'));
    }
    if (req.headers.get('x-forwarded-proto')) {
        response.headers.set('x-forwarded-proto', req.headers.get('x-forwarded-proto'));
    }
    
    // Set origin header - critical for Server Actions
    if (origin) {
        response.headers.set('origin', origin);
        req.headers.set('origin', origin);
    } else if (forwardedProto && forwardedHost) {
        const reconstructedOrigin = `${forwardedProto}://${forwardedHost}`;
        response.headers.set('origin', reconstructedOrigin);
        req.headers.set('origin', reconstructedOrigin);
    } else if (referer) {
        try {
            const refererUrl = new URL(referer);
            response.headers.set('origin', refererUrl.origin);
            req.headers.set('origin', refererUrl.origin);
        } catch {}
    } else if (req.nextUrl.origin) {
        response.headers.set('origin', req.nextUrl.origin);
        req.headers.set('origin', req.nextUrl.origin);
    }
}

export async function middleware(req) {
    const { pathname } = req.nextUrl;
    
    // Always set origin header on request for POST requests (Server Actions need this)
    // This must be done early, before any processing
    if (req.method === 'POST') {
        const origin = req.headers.get('origin');
        if (!origin) {
            const forwardedHost = req.headers.get('x-forwarded-host') || req.headers.get('host');
            const forwardedProto = req.headers.get('x-forwarded-proto') || (req.nextUrl.protocol.replace(':', ''));
            const referer = req.headers.get('referer');
            
            if (forwardedProto && forwardedHost) {
                const reconstructedOrigin = `${forwardedProto}://${forwardedHost}`;
                req.headers.set('origin', reconstructedOrigin);
            } else if (referer) {
                try {
                    const refererUrl = new URL(referer);
                    req.headers.set('origin', refererUrl.origin);
                } catch {}
            } else if (req.nextUrl.origin) {
                req.headers.set('origin', req.nextUrl.origin);
            }
        }
    }
    
    // Skip middleware for static files, API routes
    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
        const response = NextResponse.next();
        setOriginHeader(req, response);
        return response;
    }
    
    // For POST requests (might be Server Actions), ensure origin header is set
    // But still run authentication checks for protected routes
    if (req.method === 'POST') {
        const response = NextResponse.next();
        setOriginHeader(req, response);
        
        // Continue with authentication checks for efiling routes
        if (pathname.startsWith('/efiling') || pathname.startsWith('/efilinguser') || pathname === '/elogin') {
            const authResponse = await efilingAuthMiddleware(req);
            // Merge origin header into auth response
            setOriginHeader(req, authResponse);
            return authResponse;
        }
        
        // For other POST requests, return with origin header set
        return response;
    }

    // Handle e-filing authentication for efiling and efilinguser routes
    if (pathname.startsWith('/efiling') || pathname.startsWith('/efilinguser') || pathname === '/elogin') {
        const response = await efilingAuthMiddleware(req);
        // Ensure origin header is set for Server Actions
        if (req.method === 'POST') {
            setOriginHeader(req, response);
        }
        return response;
    }

    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        
        if (!token) {
            // Redirect to main page if no token and trying to access protected routes
            if (pathname !== '/login' && pathname !== '/' && !pathname.startsWith('/public')) {
                return NextResponse.redirect(new URL('/', req.url));
            }
            return NextResponse.next();
        }

        // Get dashboard based on user type
        const dashboard = getDashboardForUser(token);
        
        // Check if user is trying to access their dashboard
        if (pathname === '/') {
            return NextResponse.redirect(new URL(dashboard, req.url));
        }

        // Check permissions for different user types
        const userType = token.user?.userType;
        const userRole = token.user?.role;

        if (userType === 'user') {
            // CEO access (role 5)
            if (userRole === 5) {
                if (!isAllowed(pathname, ceoAllowed)) {
                    return NextResponse.redirect(new URL('/unauthorized', req.url));
                }
            }
            // COO access (role 6)
            else if (userRole === 6) {
                if (!isAllowed(pathname, cooAllowed)) {
                    return NextResponse.redirect(new URL('/unauthorized', req.url));
                }
            }
            // Admin/Manager access (role 1, 2)
            else if (userRole === 1 || userRole === 2) {
                if (!isAllowed(pathname, dashboardAllowed)) {
                    return NextResponse.redirect(new URL('/unauthorized', req.url));
                }
            } else {
                // Regular user - limited access
                const allowedPaths = ['/dashboard', '/dashboard/requests'];
                if (!isAllowed(pathname, allowedPaths)) {
                    return NextResponse.redirect(new URL('/unauthorized', req.url));
                }
            }
        } else if (userType === 'agent') {
            // Agent access
            if (!isAllowed(pathname, agentAllowed)) {
                return NextResponse.redirect(new URL('/unauthorized', req.url));
            }
        } else if (userType === 'socialmedia') {
            // Social media agent access - check role for different permissions
            let allowedPaths;
            if ([4, 5].includes(userRole)) {
                // Video Editor or Manager - full access
                allowedPaths = smagentAllowedB;
            } else {
                // Other roles - basic access
                allowedPaths = smagentAllowedA;
            }
            
            // Special check for my-uploads - only VIDEO EDITOR (role 4) can access
            if (pathname === '/smagent/my-uploads' && userRole !== 4) {
                return NextResponse.redirect(new URL('/unauthorized', req.url));
            }
            
            if (!isAllowed(pathname, allowedPaths)) {
                return NextResponse.redirect(new URL('/unauthorized', req.url));
            }
        } 
        
        // else if (userType === 'efiling') {
        //     // E-Filing user access
        //     const allowedPaths = ['/efiling', '/efiling/files', '/efiling/assignments', '/efiling/departments', '/efiling/tools', '/efiling/reports', '/efiling/settings'];
        //     if (!isAllowed(pathname, allowedPaths)) {
        //         return NextResponse.redirect(new URL('/unauthorized', req.url));
        //     }
        // }

        return NextResponse.next();
    } catch (error) {
        console.error('Middleware error:', error);
        return NextResponse.redirect(new URL('/', req.url));
    }
}

export const config = {
  matcher: ["/smagent/:path*", "/agent/:path*", "/dashboard/:path*", "/efiling/:path*", "/efilinguser/:path*", "/elogin", "/ceo/:path*"],
}; 