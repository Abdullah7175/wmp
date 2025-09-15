import { Suspense } from "react";
import CeoImageMigration from "./components/CeoImageMigration";

export default function CeoImageMigrationPage() {

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">CEO Image Migration</h1>
        <p className="text-gray-600 mt-2">
          Migrate CEO profile image to correct directory
        </p>
      </div>

      <Suspense fallback={<div>Loading migration...</div>}>
        <CeoImageMigration />
      </Suspense>
    </div>
  );
}
