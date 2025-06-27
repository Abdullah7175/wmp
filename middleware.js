import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/unauthorized", "/_next", "/api", "/favicon.ico", "/public"];

// Allowed roles for smagent
const smagentRolesA = [1, 2, 3, 6]; // CAMERA MAN, ASSISTANT, PHOTOGRAPHER, CONTENT CREATOR
const smagentRolesB = [4, 5]; // VIDEO EDITOR, MANAGER
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
  "/dashboard/reports"
];

const agentAllowed = [
  "/agent",
  "/agent/requests",
  "/agent/requests/new",
  "/agent/videos",
  "/agent/images"
];

const smagentAllowedA = [
  "/smagent",
  "/smagent/assigned-requests",
  "/smagent/videos/add",
  "/smagent/images/add"
];
const smagentAllowedB = [
  "/smagent",
  "/smagent/assigned-requests",
  "/smagent/final-videos",
  "/smagent/final-videos/add",
  "/smagent/images/download",
  "/smagent/videos/download",
  "/smagent/images/add",
  "/smagent/videos/add"
];

function getDashboardForUser(token) {
  if (!token) return "/login";
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

export async function middleware(req) {
    const { pathname } = req.nextUrl;
    
    // Skip middleware for static files and API routes
    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
        return NextResponse.next();
    }

    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        
        if (!token) {
            // Redirect to login if no token and trying to access protected routes
            if (pathname !== '/login' && pathname !== '/' && !pathname.startsWith('/public')) {
                return NextResponse.redirect(new URL('/login', req.url));
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
            // Admin/Manager access
            if (userRole === 1 || userRole === 2) {
                const allowedPaths = ['/dashboard', '/dashboard/requests', '/dashboard/users', '/dashboard/agents', '/dashboard/socialmediaagent', '/dashboard/complaints', '/dashboard/towns', '/dashboard/districts', '/dashboard/subtowns', '/dashboard/images', '/dashboard/videos', '/dashboard/final-videos', '/dashboard/reports', '/dashboard/roles'];
                if (!isAllowed(pathname, allowedPaths)) {
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
            const allowedPaths = ['/agent', '/agent/requests', '/agent/images', '/agent/videos'];
            if (!isAllowed(pathname, allowedPaths)) {
                return NextResponse.redirect(new URL('/unauthorized', req.url));
            }
        } else if (userType === 'socialmedia') {
            // Social media agent access
            const allowedPaths = ['/smagent', '/smagent/assigned-requests', '/smagent/images', '/smagent/videos', '/smagent/final-videos'];
            if (!isAllowed(pathname, allowedPaths)) {
                return NextResponse.redirect(new URL('/unauthorized', req.url));
            }
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Middleware error:', error);
        return NextResponse.redirect(new URL('/login', req.url));
    }
}

export const config = {
  matcher: ["/smagent/:path*", "/agent/:path*", "/dashboard/:path*"],
}; 