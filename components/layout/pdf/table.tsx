"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface FileTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    voucher?: number
    coupon?: number
}

export function FileTable<TData, TValue>({
    columns,
    data,
    voucher,
    coupon
}: FileTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const DEFAULT_SALE = 0

    return (
        <div className="overflow-hidden rounded-md border">
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
                        <>
                            {table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={cn(
                                                "",
                                                cell.column.id === "qty" ? "text-center pr-6" : "text-start"
                                            )}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}

                            {/* Thêm hàng thủ công */}
                            <TableRow>
                                <TableCell className="text-start">{table.getRowModel().rows?.length + 1}</TableCell>
                                <TableCell className="text-start">Voucher</TableCell>
                                <TableCell className="text-start"></TableCell>
                                <TableCell className="text-center pr-6"></TableCell>
                                <TableCell className="text-right"></TableCell>
                                <TableCell className="text-end">€{voucher ? voucher.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : DEFAULT_SALE.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                            </TableRow>
                        </>
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
    )
}