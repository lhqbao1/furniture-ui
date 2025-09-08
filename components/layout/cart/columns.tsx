"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CartItem } from "@/types/cart"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash } from "lucide-react"
import Image from "next/image"

interface GetCartColumnsProps {
    localQuantities: Record<string, number>
    localStatuses: Record<string, boolean>
    onUpdateQuantity: (item: CartItem, newQuantity: number) => void
    onDeleteItem: (item: CartItem) => void
    onToggleSelect: (item: CartItem, checked: boolean) => void
    isCheckout?: boolean
}

export const getCartColumns = ({
    localQuantities,
    onUpdateQuantity,
    onDeleteItem,
    onToggleSelect,
    isCheckout,
    localStatuses
}: GetCartColumnsProps): ColumnDef<CartItem>[] => [
        ...(!isCheckout
            ? [
                {
                    id: "select",
                    header: ({ table }) => {
                        // Check xem tất cả rows có đang được chọn theo localStatuses không
                        const allSelected = table.getRowModel().rows.every(
                            (row) => localStatuses[row.original.id] ?? row.original.is_active
                        );

                        const someSelected = table.getRowModel().rows.some(
                            (row) => localStatuses[row.original.id] ?? row.original.is_active
                        );

                        return (
                            <Checkbox
                                checked={allSelected}
                                onCheckedChange={(value) => {
                                    table.getRowModel().rows.forEach((row) => {
                                        onToggleSelect(row.original, value === true);
                                    });
                                }}
                                aria-label="Select all"
                            />
                        );
                    },
                    cell: ({ row }) => {
                        return (
                            <Checkbox
                                checked={Boolean(localStatuses[row.original.id] ?? row.original.is_active)}
                                onCheckedChange={(value) => onToggleSelect(row.original, value === true)}
                                aria-label="Select row"
                            />
                        );
                    },
                    enableSorting: false,
                    enableHiding: false,
                } as ColumnDef<CartItem>

            ]
            : []),
        {
            accessorKey: "product_name",
            header: "Product",
            cell: ({ row }) => {
                const item = row.original
                return (
                    <div className="flex items-center gap-3">
                        <Image
                            src={item.image_url || "/1.png"}
                            alt={item.products.name}
                            width={60}
                            height={60}
                            className="rounded"
                        />
                        <div>
                            <p className="font-semibold">{item.products.name}</p>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "item_price",
            header: "Price",
            cell: ({ row }) => <span className="font-semibold text-primary">€{row.original.item_price.toFixed(2)}</span>,
        },
        {
            accessorKey: "quantity",
            header: "Quantity",
            cell: ({ row }) => {
                const item = row.original
                const quantity = localQuantities[item.id] ?? item.quantity
                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateQuantity(item, quantity - 1)}
                        >
                            -
                        </Button>
                        <span className="px-2">{quantity}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateQuantity(item, quantity + 1)}
                            disabled={quantity >= item.products.stock}
                        >
                            +
                        </Button>
                    </div>
                )
            },
        },
        {
            accessorKey: "total",
            header: "Total",
            cell: ({ row }) => {
                const item = row.original
                const quantity = localQuantities[item.id] ?? item.quantity
                return <span className="font-semibold">{(item.item_price * quantity).toFixed(2)}$</span>
            },
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => {
                const item = row.original
                return (
                    <Button
                        variant="ghost"
                        className="text-red-500 cursor-pointer"
                        onClick={() => onDeleteItem(item)}
                    >
                        <Trash />
                    </Button>
                )
            },
        },
        {
            accessorKey: "is_active",
            id: "is_active",
            enableHiding: true,   // cho phép ẩn
            enableSorting: true,  // vẫn sort được
            header: () => null,   // không render header
            cell: () => null,     // không render cell
        },
    ]
