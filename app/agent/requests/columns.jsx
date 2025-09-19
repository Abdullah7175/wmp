"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { ArrowUpDown , MapPin  } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import Router from "next/router"
import WorkRequestStatus from "@/components/WorkRequestStatus"

export function getAgentRequestColumns({ onAddImage, onAddVideo, onAddBeforeContent }) {
  return [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "request_date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "desc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("request_date"))
        return format(date, "PPP")
      },
    },
    {
      accessorKey: "town_name",
      header: "Town",
    },
    {
      accessorKey: "complaint_type",
      header: "Department",
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => {
        const address = row.getValue("address");
        return (
          <div className="max-w-xs truncate" title={address}>
            {address || 'No address'}
          </div>
        );
      },
    },
    {
    accessorKey: "location", // dummy, not used in display
    header: "Location",
    cell: ({ row }) => {
      const lat = row.original.latitude;
      const lng = row.original.longitude;

      if (lat && lng) {
        return (
          <a 
            href={`https://www.google.com/maps?q=${lat},${lng}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              View Map
            </Button>
          </a>
        );
      }

      return <span className="text-gray-400">No location</span>;
    }
  },
   
    {
      accessorKey: "status_name",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status_name")
        
        const variantMap = {
          "Pending": "secondary",
          "Assigned": "info",
          "In Progress": "warning",
          "Completed": "success",
          "Cancelled": "destructive",
        }

        return (
          <Badge variant={variantMap[status] || "default"}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "approval_status",
      header: "Approval Status",
      cell: ({ row }) => {
        const ceoStatus = row.original.ceo_approval_status;
        const cooStatus = row.original.coo_approval_status;
        
        const getApprovalBadge = (status, type) => {
          if (!status || status === 'pending') return null;
          
          const colorClass = status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
          return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass} mr-1`}>
              {type}: {status === 'approved' ? 'Approved' : 'Not Approved'}
            </span>
          );
        };

        return (
          <div className="flex flex-col space-y-1">
            {getApprovalBadge(ceoStatus, 'CEO')}
            {getApprovalBadge(cooStatus, 'COO')}
            {!ceoStatus && !cooStatus && (
              <span className="text-xs text-gray-400">No approvals</span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row, table }) => {
        const { onAddImage, onAddVideo, onAddBeforeContent } = table.options.meta || {};
        const status = row.original.status_name;
        const isCompleted = status === 'Completed';
        const canUpload = !isCompleted;
        return (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddBeforeContent && onAddBeforeContent(row.original.id)}
              disabled={!canUpload}
              className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
            >
              Before Content
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddImage && onAddImage(row.original.id)}
              disabled={!canUpload}
            >
              Add Image
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddVideo && onAddVideo(row.original.id)}
              disabled={!canUpload}
            >
              Add Video
            </Button>
          </div>
        );
      },
    },
  ]
}