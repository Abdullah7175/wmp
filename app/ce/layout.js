import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { redirect } from "next/navigation";
import CeLayoutClient from "./CeLayoutClient";

export default async function CeLayout({ children }) {
  const session = await getServerSession(authOptions);
  
  // Check if user is CE (role 7) and userType is 'user'
  if (!session?.user || parseInt(session.user.role) !== 7 || session.user.userType !== 'user') {
    redirect('/unauthorized');
  }

  return <CeLayoutClient>{children}</CeLayoutClient>;
}
