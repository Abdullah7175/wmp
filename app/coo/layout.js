import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CooLayoutClient from "./CooLayoutClient";

export default async function CooLayout({ children }) {
  const session = await auth();
  
  // Check if user is COO (role 6) and userType is 'user'
  if (!session?.user || parseInt(session.user.role) !== 4 || session.user.userType !== 'user') {
    redirect('/unauthorized');
  }

  return <CooLayoutClient>{children}</CooLayoutClient>;
}
