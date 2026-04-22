"use client"

import { MoreHorizontal, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export const columns = [
  {
    accessorKey: "nature_of_work",
    header: "Nature of Work",
    cell: ({ row }) => (
      <span className="font-medium text-blue-700">{row.getValue("nature_of_work")}</span>
    )
  },
  {
    accessorKey: "milestone_name",
    header: "Milestone Name",
  },
  {
    accessorKey: "order_sequence",
    header: "Order",
    cell: ({ row }) => (
      <div className="bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full font-semibold">
        {row.getValue("order_sequence")}
      </div>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const milestone = row.original
      const { toast } = useToast()


        const handleDelete = async () => {
        const confirmed = window.confirm(`Are you sure you want to delete "${milestone.milestone_name}"?`);
        
        if (confirmed) {
          try {
            const response = await fetch('/api/milestones', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: milestone.id }),
            });

            if (response.ok) {
              toast({
                title: "Deleted successfully",
                variant: "success",
              });
              // Refresh the data without a full page reload if possible, 
              // or use window.location.reload() for a quick fix
              window.location.reload();
            } else {
              const errorData = await response.json();
              toast({
                title: "Delete failed",
                description: errorData.error || "You might not have permission.",
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error("Error deleting:", error);
            toast({
              title: "Error",
              description: "An unexpected error occurred.",
              variant: "destructive",
            });
          }
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/milestones/edit/${milestone.id}`} className="flex items-center cursor-pointer">
                <Edit className="mr-2 h-4 w-4" /> Edit Definition
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-red-600 flex items-center cursor-pointer focus:bg-red-50 focus:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]