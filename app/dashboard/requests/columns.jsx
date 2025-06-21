"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { ArrowUpDown , MapPin  } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useSession } from 'next-auth/react'

export const columns = [
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
    header: "Complaint Type",
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
  // {
  //   accessorKey: "latitude",
  //   header: "Location",
  //   cell: ({ row }) => {
  //     const latitude = row.getValue("latitude")
  //     const longitude = row.original.longitude
      
  //     return latitude && longitude ? (
  //       <a 
  //         href={`https://www.google.com/maps?q=${latitude},${longitude}`} 
  //         target="_blank"
  //         rel="noopener noreferrer"
  //       >
  //         <Button variant="outline" size="sm">
  //           <MapPin className="h-4 w-4 mr-2" />
  //           View Map
  //         </Button>
  //       </a>
  //     ) : (
  //       <span className="text-gray-400">No location</span>
  //     )
  //   },
  // },
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
    accessorKey: "creator_name",
    header: "Submitted By",
    cell: ({ row }) => {
      const creatorName = row.getValue("creator_name");
      const creatorType = row.original.creator_type;
      
      const typeLabels = {
        'user': 'User',
        'agent': 'Agent', 
        'socialmedia': 'Social Media'
      };
      
      return (
        <div>
          <div className="font-medium">{creatorName || 'Unknown'}</div>
          <div className="text-xs text-gray-500">
            {typeLabels[creatorType] || creatorType}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const router = useRouter();
      const { data: session } = useSession();
      const status = row.original.status_name;
      const requestId = row.original.id;
      const userRole = session?.user?.role;
      // Only admin (1) and manager (2) can generate performa for completed requests
      const canGeneratePerforma = (status === 'Completed') && (userRole === 1 || userRole === 2);
      return (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/dashboard/requests/${requestId}/edit`, '_blank')}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/requests/${requestId}`)}
          >
            Assign
          </Button>
          {canGeneratePerforma && (
            <Button
              variant="success"
              size="sm"
              onClick={() => window.open(`/dashboard/complaints/performa/${requestId}`, '_blank')}
            >
              Generate Performa
            </Button>
          )}
        </div>
      )
    },
  }
]