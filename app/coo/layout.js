import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { redirect } from "next/navigation";
import CooLayoutClient from "./CooLayoutClient";

export default async function CooLayout({ children }) {
  const session = await getServerSession(authOptions);
  
  // Check if user is COO (role 6) and userType is 'user'
  if (!session?.user || parseInt(session.user.role) !== 6 || session.user.userType !== 'user') {
    redirect('/unauthorized');
  }

  return <CooLayoutClient>{children}</CooLayoutClient>;
}
