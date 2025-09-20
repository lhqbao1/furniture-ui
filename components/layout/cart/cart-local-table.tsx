"use client"

import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table"
import { GetCartLocalColumns } from "./local-columns"
import { useIsPhone } from "@/hooks/use-is-phone"

export type CartTableItem = {
    id?: string
    product_id: string
    product_name: string
    img_url?: string
    final_price: number
    quantity: number
    is_active: boolean
    item_price: number
    stock: number
}

interface CartLocalTableProps {
    data: CartTableItem[]
    onToggleItem: (product_id: string, is_active: boolean) => void
    onToggleAll: (is_active: boolean) => void
    isCheckout?: boolean
}

export function CartLocalTable({
    data,
    onToggleItem,
    onToggleAll,
    isCheckout = false,
}: CartLocalTableProps) {
    const isPhone = useIsPhone()
    const table = useReactTable({
        data,
        // columns: baseColumns,
        columns: GetCartLocalColumns(),
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="col-span-12 lg:col-span-8 flex-1">
            <Table className="overflow-hidden overflow-x-hidden text-wrap">
                {isPhone ? '' :
                    (
                        <TableHeader className="border-t">
                            {table.getHeaderGroups().filter((headerGroup) =>
                                headerGroup.headers.some((header) => !header.isPlaceholder)
                            )
                                .map((headerGroup) => (
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
                    )
                }
                <TableBody>
                    {table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : ''}
                </TableBody>
            </Table>
        </div>
    )
}
