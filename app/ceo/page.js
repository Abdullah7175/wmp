import { Suspense } from "react";
import CeoAnalyticsPage from "./analytics/page";

export default function CeoPage() {

  return (
    <div className="p-6">
      <div className="mb-8">
        {/* <h1 className="text-3xl font-bold text-gray-900">CEO Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Comprehensive analytics and insights for KW&SC Water Corporation</p> */}
      </div>

      <Suspense fallback={<div>Loading analytics dashboard...</div>}>
        <CeoAnalyticsPage />
      </Suspense>
    </div>
  );
}
