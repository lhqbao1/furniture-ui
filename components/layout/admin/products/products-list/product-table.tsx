'use client'

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CustomPagination } from "@/components/shared/custom-pagination"
import React from "react"
import TableToolbar from "./toolbar"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    page: number
    pageSize: number
    setPage: (page: number) => void
    setPageSize: React.Dispatch<React.SetStateAction<number>>
    totalItems: number
    hasBackground?: boolean
    totalPages: number
}

export function ProductTable<TData, TValue>({
    columns,
    data,
    page,
    pageSize,
    setPage,
    setPageSize,
    totalItems,
    hasBackground,
    totalPages
}: DataTableProps<TData, TValue>) {

    const table = useReactTable({
        data,
        columns,
        pageCount: Math.ceil(totalItems / pageSize),
        state: {
            pagination: { pageIndex: page - 1, pageSize },
        },
        manualPagination: true, // phân trang server-side
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="flex flex-col items-center gap-4">
            <TableToolbar
                pageSize={pageSize}
                setPageSize={setPageSize} // đảm bảo type đúng
            />
            <div className="rounded-md border w-full overflow-x-scroll">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map((row, index) => (
                            <TableRow
                                key={row.id}
                                className={hasBackground && index % 2 === 1 ? "bg-secondary/10" : ""}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <CustomPagination
                page={page}
                totalPages={totalPages}
                onPageChange={(newPage) => setPage(newPage)}
            />
        </div>
    )
}
