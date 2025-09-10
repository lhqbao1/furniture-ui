'use client'

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash } from "lucide-react"
import Image from "next/image"
import { WishListItem } from "@/types/wishlist"
import { useTranslations } from "next-intl"

interface GetWishlistColumnsProps {
    localQuantities: Record<string, number>
    localStatuses: Record<string, boolean>
    onUpdateQuantity: (item: WishListItem, newQuantity: number) => void
    onDeleteItem: (item: WishListItem) => void
    onAddToCart: (item: WishListItem) => void
    onToggleSelect: (item: WishListItem, checked: boolean) => void
    isCheckout?: boolean
}

export const GetWishlistColumns = ({
    localQuantities,
    onUpdateQuantity,
    onDeleteItem,
    onAddToCart,
    onToggleSelect,
    isCheckout,
    localStatuses
}: GetWishlistColumnsProps): ColumnDef<WishListItem>[] => {
    const t = useTranslations()

    return [
        ...(!isCheckout
            ? [
                {
                    id: "select",
                    header: ({ table }) => {
                        const allSelected = table.getRowModel().rows.every(
                            (row) => localStatuses[row.original.id] ?? row.original.is_active
                        )

                        return (
                            <Checkbox
                                checked={allSelected}
                                onCheckedChange={(value) => {
                                    table.getRowModel().rows.forEach((row) => {
                                        onToggleSelect(row.original, value === true)
                                    })
                                }}
                                aria-label={t('selectAll')}
                            />
                        )
                    },
                    cell: ({ row }) => {
                        return (
                            <Checkbox
                                checked={Boolean(localStatuses[row.original.id] ?? row.original.is_active)}
                                onCheckedChange={(value) => onToggleSelect(row.original, value === true)}
                                aria-label={t('selectRow')}
                            />
                        )
                    },
                    enableSorting: false,
                    enableHiding: false,
                } as ColumnDef<WishListItem>
            ]
            : []),
        {
            accessorKey: "product_name",
            header: t('product'),
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
            accessorKey: "quantity",
            header: t('quantity'),
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
            accessorKey: "item_price",
            header: t('price'),
            cell: ({ row }) => <span className="font-semibold">€{row.original.item_price.toFixed(2)}</span>,
        },
        {
            accessorKey: "total",
            header: t('total'),
            cell: ({ row }) => {
                const item = row.original
                const quantity = localQuantities[item.id] ?? item.quantity
                return <span className="font-semibold text-primary">€{(item.item_price * quantity).toFixed(2)}</span>
            },
        },
        {
            accessorKey: "item_stock",
            header: t('stock'),
            cell: ({ row }) => <span>{row.original.products.stock} {t('left')}</span>,
        },
        {
            id: "actions",
            header: t('actions'),
            cell: ({ row }) => {
                const item = row.original
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            className="text-red-500 cursor-pointer"
                            onClick={() => onDeleteItem(item)}
                        >
                            <Trash />
                        </Button>
                        <Button
                            onClick={() => onAddToCart(item)}
                        >
                            {t('addToCart')}
                        </Button>
                    </div>
                )
            },
        },
        {
            accessorKey: "is_active",
            id: "is_active",
            enableHiding: true,
            enableSorting: true,
            header: () => null,
            cell: () => null,
        },
    ]
}
