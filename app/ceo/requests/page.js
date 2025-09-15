import { Suspense } from "react";
import AllRequestsList from "./components/AllRequestsList";

export default function AllRequestsPage() {

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Work Requests</h1>
        <p className="text-gray-600 mt-2">
          View all work requests and add CEO comments
        </p>
      </div>

      <Suspense fallback={<div>Loading requests...</div>}>
        <AllRequestsList />
      </Suspense>
    </div>
  );
}
