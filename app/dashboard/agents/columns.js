"use client"

import { MoreHorizontal } from "lucide-react"

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

// Improved getRoleLabel to handle string/number
const getRoleLabel = (role) => {
  const roles = {
    1: 'Executive Engineer',
    2: 'Contractor',
    '1': 'Executive Engineer',
    '2': 'Contractor',
  };
  return roles[role] || 'Unknown';
};

export const columns = [
  {
    accessorKey: "image",
    header: "Image",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "designation",
    header: "Designation",
  },
  {
    accessorKey: "contact_number",
    header: "Contact",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role");
      return <span>{getRoleLabel(role)}</span>;
    },
  },
  {
    accessorKey: "complaint_type",
    header: "Complaint Type",
    cell: ({ row }) => {
      const type = row.original.complaint_type;
      return <span>{type || row.original.complaint_type_id || '-'}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const agent = row.original

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
            <DropdownMenuItem>
              <Link href={`/dashboard/agents/edit/${agent.id}`}>Edit Engineer</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
            <Link className="text-red-700" href={`/dashboard/agents/delete/${agent.id}`}>Delete Engineer</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
