"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { ArrowUpDown , MapPin  } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import Router from "next/router"
import WorkRequestStatus from "@/components/WorkRequestStatus"

export function getAgentRequestColumns({ onAddImage, onAddVideo, onAddBeforeImage }) {
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
      header: "CEO Approval",
      cell: ({ row }) => {
        const approvalStatus = row.original.approval_status;
        return (
          <WorkRequestStatus 
            approvalStatus={approvalStatus}
            status={row.original.status_name}
            className="text-xs"
          />
        );
      },
    },
    {
      id: "actions",
      cell: ({ row, table }) => {
        const { onAddImage, onAddVideo, onAddBeforeImage } = table.options.meta || {};
        const status = row.original.status_name;
        const isCompleted = status === 'Completed';
        const canUpload = !isCompleted;
        return (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddBeforeImage && onAddBeforeImage(row.original.id)}
              disabled={!canUpload}
              className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
            >
              Before Images
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