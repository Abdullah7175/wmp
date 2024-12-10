"use client";

import { useState } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getFilteredRowModel,
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
        state: {
            sorting,
            columnFilters,
        },
    });

    return (
        <>
            <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center py-4">
                {children}
                <div className="flex gap-3 items-center justify-end flex-1">
                    <Link href={"/dashboard/roles/add"}>
                        <Button variant="primary" className="border px-3">
                            <Plus /> Add Roles
                        </Button>
                    </Link>
                    <Input
                        placeholder="Filter Roles"
                        value={table.getColumn("email")?.getFilterValue() || ""}
                        onChange={(event) =>
                            table.getColumn("email")?.setFilterValue(event.target.value)
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
                                            {cell.column.id === "image" ? (
                                                cell.getValue() ? (
                                                    <Image
                                                        src={cell.getValue()}
                                                        alt="User Image"
                                                        className="w-10 h-10 object-cover rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <Image
                                                            src="https://placehold.co/100"
                                                            width={100}
                                                            height={100}
                                                            alt="User Image"
                                                            className="w-10 h-10 object-cover rounded-full"
                                                        />
                                                    </div>
                                                )
                                            ) : (
                                                flexRender(cell.column.columnDef.cell, cell.getContext())
                                            )}
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
