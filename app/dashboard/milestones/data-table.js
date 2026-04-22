"use client"
import { useState } from "react"
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getFilteredRowModel,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { hasPermission } from "@/permissions"

export function DataTable({ columns, data, children }) {
    const [columnFilters, setColumnFilters] = useState([])
    // Mock user for permission check - matching your user file pattern
    const user = { role: 1 } 

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            columnFilters,
        },
    })

    return (
        <>
            <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center py-4">
                {children}
                <div className="flex gap-3 items-center justify-end flex-1">
                 {hasPermission(user, "delete:comments") && ( 
                <Link href={"/dashboard/milestones/add"}>
                    <Button variant="primary" className="border px-3 bg-blue-600 text-white hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4"/> Add Milestone
                    </Button>
                </Link>
                )}
                <Input
                    placeholder="Search milestones..."
                    value={table.getColumn("milestone_name")?.getFilterValue() || ""}
                    onChange={(event) =>
                        table.getColumn("milestone_name")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm bg-gray-100 shadow-sm"
                />
                </div>
            </div>

            <div className="rounded-md border mt-4">
                <Table>
                    <TableHeader className="bg-gray-50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No milestones defined.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    )
}