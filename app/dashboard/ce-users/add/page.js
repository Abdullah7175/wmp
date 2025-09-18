import { Suspense } from "react";
import AddCeUserForm from "./components/AddCeUserForm";

export default function AddCeUserPage() {
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Add CE User</h1>
        <p className="text-sm lg:text-base text-gray-600 mt-2">
          Create a new Chief Engineer user account
        </p>
      </div>

      <Suspense fallback={<div>Loading form...</div>}>
        <AddCeUserForm />
      </Suspense>
    </div>
  );
}
