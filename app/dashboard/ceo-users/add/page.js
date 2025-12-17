import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AddCeoUserForm from "./components/AddCeoUserForm";

export default async function AddCeoUserPage() {
  const session = await auth();
  
  // Only allow admins (role 1) to access this page
  if (!session?.user || session.user.userType !== 'user' || parseInt(session.user.role) !== 1) {
    redirect('/unauthorized');
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add CEO User</h1>
        <p className="text-gray-600 mt-2">
          Create a new CEO account for the approval workflow system
        </p>
      </div>

      <Suspense fallback={<div>Loading form...</div>}>
        <AddCeoUserForm />
      </Suspense>
    </div>
  );
}
