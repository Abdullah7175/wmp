import { Suspense } from "react";
import CeoDashboard from "./components/CeoDashboard";

export default function CeoPage() {

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">CEO Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the KW&SC Water Corporation CEO Portal</p>
      </div>

      <Suspense fallback={<div>Loading dashboard...</div>}>
        <CeoDashboard />
      </Suspense>
    </div>
  );
}
