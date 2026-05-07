"use client";

import { useState } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getFilteredRowModel,getPaginationRowModel
} from "@tanstack/react-table";

import { 
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function DataTable({ columns, data, children }) {
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(), // ADD THIS LINE
        initialState: {
            pagination: {
                pageSize: 5,
            },
        },
        state: {
            columnFilters,
        },
    });

    return (
        <>
            <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center py-4">
                {children}
                <div className="flex gap-3 items-center justify-end flex-1">
                    <Link href={"/dashboard/videos/add"}>
                        <Button variant="primary" className="border px-3">
                            <Plus /> Add Video
                        </Button>
                    </Link>
                    <Input
                        placeholder="Filter Videos By Work Request ID..."
                        value={table.getColumn("work_request_id")?.getFilterValue() || ""}
                        onChange={(event) =>
                            table.getColumn("work_request_id")?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm bg-gray-100 shadow-sm"
                    />
                </div>
            </div>

            <div className="rounded-md border mt-4">
                <Table>
                    <TableHeader>
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
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}