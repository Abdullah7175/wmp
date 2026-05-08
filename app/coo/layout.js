import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CooLayoutClient from "./CooLayoutClient";

export default async function CooLayout({ children }) {
  const session = await auth();
  
  // Check if user is COO (role 6) and userType is 'user'
  if (!session?.user || parseInt(session.user.role) !== 6 || session.user.userType !== 'user') {
    redirect('/unauthorized');
  }


    console.log('COO Layout - Session check:', {
    hasSession: !!session,
    hasUser: !!session?.user,
    userRole: session?.user?.role,
    userRoleType: typeof session?.user?.role,
    parsedRole: session?.user?.role ? parseInt(session.user.role) : null,
    userType: session?.user?.userType,
    fullUser: session?.user
  });

  return <CooLayoutClient>{children}</CooLayoutClient>;
}
