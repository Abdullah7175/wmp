import { Suspense } from "react";
import ComplaintTypesList from "./components/ComplaintTypesList";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ComplaintTypesPage() {
  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Departments</h1>
        <Link href="/dashboard/complaint-types/add">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Department
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading Departments...</div>}>
        <ComplaintTypesList />
      </Suspense>
    </div>
  );
}