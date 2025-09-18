import { Suspense } from "react";
import CeAnalyticsPage from "./analytics/page";

export default function CePage() {

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">CE Dashboard</h1>
        <p className="text-sm lg:text-base text-gray-600">Comprehensive overview of KW&SC engineering operations</p>
      </div>

      <Suspense fallback={<div>Loading dashboard...</div>}>
        <CeAnalyticsPage />
      </Suspense>
    </div>
  );
}
