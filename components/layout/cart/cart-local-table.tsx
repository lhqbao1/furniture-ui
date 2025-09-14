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
    ColumnDef,
} from "@tanstack/react-table"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import { useCartLocal } from "@/hooks/cart"
import { Button } from "@/components/ui/button"

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
    const { updateQuantity } = useCartLocal()

    // kiểm tra nếu tất cả đều active
    const allSelected = data.length > 0 && data.every((item) => item.is_active)
    const someSelected = data.some((item) => item.is_active)

    const onUpdateQuantity = (item: CartTableItem, newQuantity: number) => {
        if (newQuantity < 1) return
        if (item.stock && newQuantity > item.stock) return
        updateQuantity({ product_id: item.product_id, quantity: newQuantity })
    }

    // định nghĩa cột
    const baseColumns: ColumnDef<CartTableItem>[] = [
        {
            accessorKey: "product_name",
            header: "Product",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {row.original.img_url && (
                        <Image
                            src={row.original.img_url}
                            alt={row.original.product_name}
                            width={70}
                            height={70}
                            className="w-12 h-12 object-cover rounded"
                        />
                    )}
                    <span>{row.original.product_name}</span>
                </div>
            ),
        },
        {
            accessorKey: "quantity",
            header: "Quantity",
            cell: ({ row }) => {
                const item = row.original
                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateQuantity(item, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                        >
                            -
                        </Button>
                        <span className="px-2">{item.quantity}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateQuantity(item, item.quantity + 1)}
                            disabled={item.stock ? item.quantity >= item.stock : false}
                        >
                            +
                        </Button>
                    </div>
                )
            },
        },
        {
            accessorKey: "final_price",
            header: "Price",
            cell: ({ row }) => (
                <div>${(row.original.item_price * row.original.quantity).toFixed(2)}</div>
            ),
        },
    ]

    // thêm cột select nếu không phải checkout
    const columns: ColumnDef<CartTableItem>[] = isCheckout
        ? baseColumns
        : [
            {
                id: "select",
                header: () => (
                    <Checkbox
                        checked={
                            allSelected
                                ? true
                                : someSelected
                                    ? "indeterminate"
                                    : false
                        }
                        onCheckedChange={(value) => onToggleAll(!!value)}
                        aria-label="Select all"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.original.is_active}
                        onCheckedChange={(value) =>
                            onToggleItem(row.original.product_id, !!value)
                        }
                    />
                ),
            },
            ...baseColumns,
        ]

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="col-span-12 lg:col-span-8 flex-1">
            <Table>
                <TableHeader className="border-t">
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
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No items in cart
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
