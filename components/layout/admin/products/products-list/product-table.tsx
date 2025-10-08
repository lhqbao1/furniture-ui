'use client'

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
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
    addButtonText?: string
    addButtonUrl?: string
    isAddButtonModal?: boolean
    addButtonModalContent?: React.ReactNode

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
    totalPages,
    addButtonText,
    addButtonUrl,
    isAddButtonModal = false,
    addButtonModalContent
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([
        { id: "updated_at", desc: true }, // mặc định sort theo updated_at giảm dần
    ])

    const table = useReactTable({
        data,
        columns,
        pageCount: Math.ceil(totalItems / pageSize),
        state: {
            pagination: { pageIndex: page - 1, pageSize },
            sorting
        },
        manualPagination: true,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        manualSorting: true,
    })

    return (
        <div className="flex flex-col gap-4">
            <p>{totalItems} items found</p>
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
                                className={hasBackground && index % 2 === 1 ? "bg-secondary/5" : ""}
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
