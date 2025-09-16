import { Suspense } from "react";
import CooProfileForm from "./components/CooProfileForm";

export default function CooProfilePage() {

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your COO account information and security settings
        </p>
      </div>

      <Suspense fallback={<div>Loading profile...</div>}>
        <CooProfileForm />
      </Suspense>
    </div>
  );
}
