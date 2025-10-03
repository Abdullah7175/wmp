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
import {Badge} from '@/components/ui/badge'
import Link from "next/link"
export const columns = [
  {
    accessorKey: "id",
    header: "Case ID",
  },
  {
    accessorKey: "subject",
    header: "Subject",
  },
  {
    accessorKey: "town",
    header: "Town",
  },
  {
    accessorKey: "survey_date",
    header: "Survey Date",
    cell: ({ getValue }) => {
      const surveyDate = getValue();
      if (!surveyDate) return 'N/A';
      const date = new Date(surveyDate);
      return date.toLocaleDateString('en-US');
    },
  },
  {
    accessorKey: "agent",
    header: "Agent",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status_val = getValue();
      console.log(status_val)
      if(status_val == 1){
        return (
          <Badge variant="secondary">In Progress</Badge>
        )
      }
      return (
        <Badge variant="primary">Completed</Badge>
      )
    },
  },
  {
    accessorKey: "complaint_type",
    header: "Complaint Type",
  },
  {
    accessorKey: "complaint_subtype",
    header: "Complaint Subtype",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const caseID = row.original
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
            <Link href={`/dashboard/complaints/performa/${caseID.id}`}>Generate Performa</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/dashboard/complaints/edit/${caseID.id}`}>Edit Complaint</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
            <Link className="text-red-700" href={`/dashboard/complaints/delete/${caseID.id}`}>Delete Complaint</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
