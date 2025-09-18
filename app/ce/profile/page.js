import { Suspense } from "react";
import CeProfileForm from "./components/CeProfileForm";

export default function CeProfilePage() {
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm lg:text-base text-gray-600 mt-2">
          Manage your CE profile information
        </p>
      </div>

      <Suspense fallback={<div>Loading profile...</div>}>
        <CeProfileForm />
      </Suspense>
    </div>
  );
}
