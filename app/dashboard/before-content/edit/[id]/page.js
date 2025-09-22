import { Suspense } from "react";
import EditBeforeContentForm from "./components/EditBeforeContentForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditBeforeContentPage({ params }) {
  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/before-images">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Before Images
            </Button>
          </Link>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Edit Before Content</h1>
        </div>
      </div>

      <Suspense fallback={<div>Loading form...</div>}>
        <EditBeforeContentForm contentId={params.id} />
      </Suspense>
    </div>
  );
}
