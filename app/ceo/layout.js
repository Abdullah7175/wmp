import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { redirect } from "next/navigation";
import CeoLayoutClient from "./CeoLayoutClient";

export default async function CeoLayout({ children }) {
  const session = await getServerSession(authOptions);
  
  // Check if user is CEO (role 5) and userType is 'user'
  if (!session?.user || parseInt(session.user.role) !== 5 || session.user.userType !== 'user') {
    redirect('/unauthorized');
  }

  return <CeoLayoutClient>{children}</CeoLayoutClient>;
}
