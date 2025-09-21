import { Suspense } from "react";
import RejectedRequestsList from "./components/RejectedRequestsList";

export default function RejectedRequestsPage() {
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Rejected Requests</h1>
        <p className="text-sm lg:text-base text-gray-600 mt-2">
          View all requests rejected by CE
        </p>
      </div>

      <Suspense fallback={<div>Loading rejected requests...</div>}>
        <RejectedRequestsList />
      </Suspense>
    </div>
  );
}
import RejectedRequestsList from "./components/RejectedRequestsList";

export default function RejectedRequestsPage() {
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Rejected Requests</h1>
        <p className="text-sm lg:text-base text-gray-600 mt-2">
          View all requests rejected by CE
        </p>
      </div>

      <Suspense fallback={<div>Loading rejected requests...</div>}>
        <RejectedRequestsList />
      </Suspense>
    </div>
  );
}
