import { Suspense } from "react";
import AllRequestsList from "./components/AllRequestsList";

export default function AllRequestsPage() {
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">All Works</h1>
        <p className="text-sm lg:text-base text-gray-600 mt-2">
          View all works and add CE comments
        </p>
      </div>

      <Suspense fallback={<div>Loading works...</div>}>
        <AllRequestsList />
      </Suspense>
    </div>
  );
}