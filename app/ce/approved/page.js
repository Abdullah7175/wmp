import { Suspense } from "react";
import ApprovedRequestsList from "./components/ApprovedRequestsList";

export default function ApprovedRequestsPage() {
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Approved Requests</h1>
        <p className="text-sm lg:text-base text-gray-600 mt-2">
          View all requests approved by CE
        </p>
      </div>

      <Suspense fallback={<div>Loading approved requests...</div>}>
        <ApprovedRequestsList />
      </Suspense>
    </div>
  );
}
import ApprovedRequestsList from "./components/ApprovedRequestsList";

export default function ApprovedRequestsPage() {
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Approved Requests</h1>
        <p className="text-sm lg:text-base text-gray-600 mt-2">
          View all requests approved by CE
        </p>
      </div>

      <Suspense fallback={<div>Loading approved requests...</div>}>
        <ApprovedRequestsList />
      </Suspense>
    </div>
  );
}
