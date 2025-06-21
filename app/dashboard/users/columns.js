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
import Image from "next/image"

const getRoleName = (roleId) => {
    switch(roleId) {
        case 1: return 'Admin';
        case 2: return 'Manager';
        case 3: return 'Accountant';
        default: return 'Unknown';
    }
}

export const columns = [
  {
  accessorKey: "image",
  header: "Image",
  cell: ({ row }) => {
    const imageUrl = row.getValue("image");
    return (
      <div className="relative w-10 h-10 rounded-full overflow-hidden">
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt="User" 
            width={40}  // Added width
            height={40} // Added height
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-500">No image</span>
          </div>
        )}
      </div>
    );
  }
},
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "contact_number",
    header: "Contact",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
        const roleId = row.getValue("role");
        return <span>{getRoleName(roleId)}</span>;
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original

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
              <Link href={`/dashboard/users/edit/${user.id}`}>View/Edit User</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link className="text-red-700" href={`/dashboard/users/delete/${user.id}`}>Delete User</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]