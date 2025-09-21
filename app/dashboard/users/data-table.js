"use client"
import { useState } from "react"

// URL validation function
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}
import {
    ColumnDef,
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
import { Bell, Plus } from "lucide-react"
import Link from "next/link"
// Using regular img tag instead of Next.js Image for better URL handling
import { hasPermission,ROLES } from "@/permissions"

export function DataTable({ columns, data, children }) {
    const [sorting, setSorting] = useState([])
    const [columnFilters, setColumnFilters] = useState([])
    const user={role:1}

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
    })


    return (
        <>
            <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center py-4">
                {children}
                <div className="flex gap-3 items-center justify-end flex-1">
                 {hasPermission(user,"delete:comments")&&( 
                <Link href={"/dashboard/users/add"}>
                    <Button variant="primary" className="border px-3">
                        <Plus/> Add User
                    </Button>
                </Link>
                )}
                <Input
                    placeholder="Filter emails..."
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
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
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
                                                cell.getValue() && isValidUrl(cell.getValue()) ? (
                                                    <>
                                                        <img
                                                            src={cell.getValue()}
                                                            alt="User Image"
                                                            className="w-10 h-10 object-cover rounded-full"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                        <div 
                                                            className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"
                                                            style={{ display: 'none' }}
                                                        >
                                                            <span className="text-gray-500 text-xs">No Image</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <span className="text-gray-500 text-xs">No Image</span>
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
    )
}

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
    )
}
