import { Suspense } from "react";
import CEDashboard from "./components/CEDashboard";

export default function CEPage() {
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Chief Engineer Portal</h1>
        <p className="text-sm lg:text-base text-gray-600 mt-2">
          Welcome to the Chief Engineer portal. Manage work requests and provide approvals.
        </p>
      </div>
      
      <Suspense fallback={<div>Loading dashboard...</div>}>
        <CEDashboard />
      </Suspense>
    </div>
  );
}