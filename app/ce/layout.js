import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import CESidebar from "./CESidebar";

export default async function CELayout({ children }) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and has CE role (7)
  if (!session?.user || session.user.userType !== 'user' || parseInt(session.user.role) !== 7) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <CESidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
