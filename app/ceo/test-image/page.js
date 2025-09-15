import { Suspense } from "react";
import CeoImageTest from "./components/CeoImageTest";

export default function CeoImageTestPage() {

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">CEO Image Test</h1>
        <p className="text-gray-600 mt-2">
          Debug CEO profile image display issues
        </p>
      </div>

      <Suspense fallback={<div>Loading image test...</div>}>
        <CeoImageTest />
      </Suspense>
    </div>
  );
}
