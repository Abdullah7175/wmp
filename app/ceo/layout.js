import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CeoLayoutClient from "./CeoLayoutClient";

export default async function CeoLayout({ children }) {
  const session = await auth();

  // Check if user is CEO / Executive (role 8 or 24) or authorized dual-portal user
  const userRole = session?.user?.role;
  const roleNumber = typeof userRole === 'number' ? userRole : parseInt(userRole);
  
  const isDual = session?.user?.isDualPortal;
  const isAllowedCeo = roleNumber === 8 || roleNumber === 24 || isDual;
  
  if (!session?.user || !isAllowedCeo || session.user.userType !== 'user') {
    redirect('/unauthorized');
  }

  return <CeoLayoutClient>{children}</CeoLayoutClient>;
}
