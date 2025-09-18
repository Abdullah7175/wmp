import { Suspense } from "react";
import CeUsersList from "./components/CeUsersList";

export default function CeUsersPage() {
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">CE Users Management</h1>
        <p className="text-sm lg:text-base text-gray-600 mt-2">
          Manage Chief Engineer users and their department assignments
        </p>
      </div>

      <Suspense fallback={<div>Loading CE users...</div>}>
        <CeUsersList />
      </Suspense>
    </div>
  );
}
