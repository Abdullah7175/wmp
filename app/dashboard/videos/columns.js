"use client"

import { MoreHorizontal ,MapPin  } from "lucide-react"
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

export const columns = [
  {
    accessorKey: "work_request_id",
    header: "Work Request ID",
  },
  {
    accessorKey: "location_label",
    header: "Division / Town",
    cell: ({ row }) => {
      const divisionName = row.original.division_name;
      const townName = row.original.town_name;
      if (divisionName) {
        return (
          <div>
            <div className="font-medium text-slate-900">{divisionName}</div>
            {townName && (
              <div className="text-xs text-slate-500">Linked town: {townName}</div>
            )}
          </div>
        );
      }
      return townName ? townName : <span className="text-slate-400">—</span>;
    },
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
  accessorKey: "location", 
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
    accessorKey: "link",
    header: "Video",
    cell: ({ row }) => {
      const video = row.original;
      return (
        <Link href={video.link} target="_blank" rel="noopener noreferrer">
          <Button variant="primary">Watch</Button>
        </Link>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Uploaded On",
    cell: ({ getValue }) => {
      const date = new Date(getValue());
      return date.toLocaleDateString();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const video = row.original;

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
              <Link href={video.link} target="_blank" rel="noopener noreferrer">Watch Video</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link className="text-red-700" href={`/dashboard/videos/edit/${video.id}`}>
                  Edit Video
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link className="text-red-700" href={`/dashboard/videos/delete/${video.id}`}>
                  Delete Video
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]