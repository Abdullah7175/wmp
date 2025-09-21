import { Suspense } from "react";
import RequestDetails from "./components/RequestDetails";

export default function RequestDetailsPage() {
  return (
    <div className="p-4 lg:p-6">
      <Suspense fallback={<div>Loading request details...</div>}>
        <RequestDetails />
      </Suspense>
    </div>
  );
}
import RequestDetails from "./components/RequestDetails";

export default function RequestDetailsPage() {
  return (
    <div className="p-4 lg:p-6">
      <Suspense fallback={<div>Loading request details...</div>}>
        <RequestDetails />
      </Suspense>
    </div>
  );
}
