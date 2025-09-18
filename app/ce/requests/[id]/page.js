import { Suspense } from "react";
import RequestApprovalForm from "./components/RequestApprovalForm";

export default function RequestPage({ params }) {
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Request Details</h1>
        <p className="text-sm lg:text-base text-gray-600 mt-2">
          Review and provide CE approval for this work request
        </p>
      </div>

      <Suspense fallback={<div>Loading request details...</div>}>
        <RequestApprovalForm requestId={params.id} />
      </Suspense>
    </div>
  );
}
