"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CustomPagination } from "@/components/shared/custom-pagination"
import React, { useState } from "react"
import TableToolbar from "./toolbar"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    hasBackground?: boolean
}

export function ProductTable<TData, TValue>({
    columns,
    data,
    hasBackground
}: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = React.useState({})
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const table = useReactTable({
        data,
        columns,
        state: {
            pagination: {
                pageIndex: page - 1, // react-table dùng index bắt đầu từ 0
                pageSize: pageSize,
            },
            rowSelection,
        },
        onPaginationChange: (updater) => {
            const next = typeof updater === "function" ? updater({ pageIndex: page - 1, pageSize }) : updater
            setPage(next.pageIndex + 1)
            setPageSize(next.pageSize)
        },
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(), // hoặc getPaginationRowModel nếu bạn dùng phân trang thực sự
    })


    return (
        <div className="flex flex-col items-center gap-4">
            <TableToolbar
                pageSize={pageSize}
                setPageSize={setPageSize}
            />
            <div className="rounded-md border w-full overflow-x-scroll">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => {
                            return (
                                <TableRow key={headerGroup.id} className="">
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            )
                        })}
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
                page={table.getState().pagination.pageIndex + 1}
                totalPages={Math.ceil(data.length / table.getState().pagination.pageSize)}
                onPageChange={(newPage) => table.setPageIndex(newPage - 1)}
            />
        </div>
    )
}
