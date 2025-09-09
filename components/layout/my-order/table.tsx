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
import { CheckOut } from "@/types/checkout"
import { formatDateTime } from "@/lib/date-formated"

interface MyOrderDataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    orderData: CheckOut
}

export function MyOrderDataTable<TData, TValue>({
    columns,
    data,
    orderData
}: MyOrderDataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="overflow-hidden rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead colSpan={columns.length} className="bg-secondary/15 px-2">
                            <div className="flex justify-between w-full">
                                <div className="text-base text-[#666666] font-semibold">Order ID: #{orderData.checkout_code}</div>
                                <div className="flex gap-3">
                                    <p className="text-sm text-[#666666]">{formatDateTime(orderData.created_at)}</p>
                                    <p>{orderData.status}</p>
                                </div>
                            </div>
                        </TableHead>
                    </TableRow>
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
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}

                            {/* Hàng custom hiển thị total */}
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="border-t pt-2 text-right font-semibold"
                                >
                                    Total: {(orderData.total_amount).toFixed(2)}
                                </TableCell>
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