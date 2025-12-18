import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CeoLayoutClient from "./CeoLayoutClient";

export default async function CeoLayout({ children }) {
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
