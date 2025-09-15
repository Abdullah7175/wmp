import { Suspense } from "react";
import PendingRequestsList from "./components/PendingRequestsList";

export default function PendingRequestsPage() {

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="text-gray-600 mt-2">
          Review and approve work requests requiring CEO authorization
        </p>
      </div>

      <Suspense fallback={<div>Loading requests...</div>}>
        <PendingRequestsList />
      </Suspense>
    </div>
  );
}
