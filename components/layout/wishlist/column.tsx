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
                            src={item.image_url || "/placeholder-product.webp"}
                            alt={item.products.name}
                            width={60}
                            height={60}
                            className="rounded"
                            unoptimized
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
            size: 80,
            cell: ({ row }) => {
                const item = row.original
                const quantity = localQuantities[item.id] ?? item.quantity
                return (
                    <div className="flex items-center gap-2 whitespace-nowrap">
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
            size: 100,
            header: () => <div className="text-right">{t('price')}</div>,
            cell: ({ row }) => <div className="font-semibold text-right">€{row.original.item_price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>,
        },
        {
            accessorKey: "total",
            header: () => <div className="text-right">{t('total')}</div>,
            cell: ({ row }) => {
                const item = row.original
                const quantity = localQuantities[item.id] ?? item.quantity
                return <div className="font-semibold text-primary text-right">€{(item.item_price * quantity).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            },
        },
        {
            accessorKey: "item_stock",
            header: () => <div className="text-center">{t('stock')}</div>,
            cell: ({ row }) => <div className="text-center">{row.original.products.stock} {t('left')}</div>,
        },
        {
            id: "actions",
            header: () => <div className="text-center">{t('actions')}</div>,
            cell: ({ row }) => {
                const item = row.original
                return (
                    <div className="flex gap-2 justify-center">
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
