import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import CeoLayoutClient from "./CeoLayoutClient";

export default async function CeoLayout({ children }) {
  // Get headers to access cookies
  const headersList = await headers();
  const cookieHeader = headersList.get('cookie');
  
  // Debug: Log available cookies
  console.log('CEO Layout - Cookie check:', {
    hasCookieHeader: !!cookieHeader,
    cookieHeader: cookieHeader ? cookieHeader.substring(0, 200) : null,
    cookieNames: cookieHeader ? cookieHeader.split(';').map(c => c.split('=')[0].trim()) : []
  });
  
  const session = await auth();
  
  // Debug logging
  console.log('CEO Layout - Session check:', {
    hasSession: !!session,
    hasUser: !!session?.user,
    userRole: session?.user?.role,
    userRoleType: typeof session?.user?.role,
    parsedRole: session?.user?.role ? parseInt(session.user.role) : null,
    userType: session?.user?.userType,
    fullUser: session?.user
  });
  
  // Check if user is CEO (role 5) and userType is 'user'
  // Handle both string and number role values
  const userRole = session?.user?.role;
  const roleNumber = typeof userRole === 'number' ? userRole : parseInt(userRole);
  
  if (!session?.user || roleNumber !== 5 || session.user.userType !== 'user') {
    console.log('CEO Layout - Access DENIED:', {
      hasUser: !!session?.user,
      roleNumber,
      expectedRole: 5,
      userType: session?.user?.userType,
      expectedUserType: 'user'
    });
    redirect('/unauthorized');
  }

  console.log('CEO Layout - Access GRANTED');
  return <CeoLayoutClient>{children}</CeoLayoutClient>;
}
