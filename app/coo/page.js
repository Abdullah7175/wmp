import { Suspense } from "react";
import CooAnalyticsPage from "./analytics/page";

export default function CooPage() {

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">COO Dashboard</h1>
        <p className="text-sm lg:text-base text-gray-600">Comprehensive overview of KW&SC operations</p>
      </div>

      <Suspense fallback={<div>Loading dashboard...</div>}>
        <CooAnalyticsPage />
      </Suspense>
    </div>
  );
}
