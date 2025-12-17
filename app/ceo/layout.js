import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CeoLayoutClient from "./CeoLayoutClient";

export default async function CeoLayout({ children }) {
  const session = await auth();
  
  // Check if user is CEO (role 5) and userType is 'user'
  if (!session?.user || parseInt(session.user.role) !== 5 || session.user.userType !== 'user') {
    redirect('/unauthorized');
  }

  return <CeoLayoutClient>{children}</CeoLayoutClient>;
}
