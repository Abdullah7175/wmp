import { Suspense } from "react";
import AddComplaintTypeForm from "./components/AddComplaintTypeForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AddComplaintTypePage() {
  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/complaint-types">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Complaint Types
            </Button>
          </Link>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Add Complaint Type</h1>
        </div>
      </div>

      <Suspense fallback={<div>Loading form...</div>}>
        <AddComplaintTypeForm />
      </Suspense>
    </div>
  );
}
import AddComplaintTypeForm from "./components/AddComplaintTypeForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AddComplaintTypePage() {
  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/complaint-types">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Complaint Types
            </Button>
          </Link>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Add Complaint Type</h1>
        </div>
      </div>

      <Suspense fallback={<div>Loading form...</div>}>
        <AddComplaintTypeForm />
      </Suspense>
    </div>
  );
}
