import { Suspense } from "react";
import EditComplaintTypeForm from "./components/EditComplaintTypeForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function EditComplaintTypePage({ params }) {
  const { id } = await params;

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/complaint-types">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Departments
            </Button>
          </Link>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Edit Department</h1>
        </div>
      </div>

      <Suspense fallback={<div>Loading form...</div>}>
        <EditComplaintTypeForm complaintTypeId={id} />
      </Suspense>
    </div>
  );
}