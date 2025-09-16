"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CartItem } from "@/types/cart"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { useMediaQuery } from "react-responsive"

interface GetCartColumnsProps {
    localQuantities: Record<string, number>
    localStatuses: Record<string, boolean>
    onUpdateQuantity: (item: CartItem, newQuantity: number) => void
    onDeleteItem: (item: CartItem) => void
    onToggleSelect: (item: CartItem, checked: boolean) => void
    isCheckout?: boolean
}

export const GetCartColumns = ({
    localQuantities,
    onUpdateQuantity,
    onDeleteItem,
    onToggleSelect,
    isCheckout,
    localStatuses
}: GetCartColumnsProps): ColumnDef<CartItem>[] => {
    const t = useTranslations()
    const isMobile = useMediaQuery({ maxWidth: 650 })

    const actionsColumn: ColumnDef<CartItem> = {
        id: "actions",
        cell: ({ row }) => {
            const item = row.original
            return (
                <div className="flex justify-end">
                    <Trash
                        className="text-red-500 cursor-pointer"
                        onClick={() => onDeleteItem(item)}
                        size={20}
                    />
                </div>
            )
        },
    }

    const selectColumn: ColumnDef<CartItem> | undefined = !isCheckout
        ? {
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
            cell: ({ row }) => (
                <Checkbox
                    checked={Boolean(localStatuses[row.original.id] ?? row.original.is_active)}
                    onCheckedChange={(value) => onToggleSelect(row.original, value === true)}
                    aria-label={t('selectRow')}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        }
        : undefined

    const columns: ColumnDef<CartItem>[] = [
        {
            accessorKey: "product_name",
            header: t('product'),
            cell: ({ row }) => {
                const item = row.original
                return (
                    <div className="flex items-center gap-3 w-60 text-wrap">
                        <Image
                            src={item.image_url || "/1.png"}
                            alt={item.products.name}
                            width={60}
                            height={60}
                            className="rounded shrink-0"
                            unoptimized
                        />
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold break-words truncate">
                                {item.products.name}
                            </p>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "item_price",
            header: () => <div className="text-right">{t('price')}</div>,
            cell: ({ row }) => <div className="font-semibold text-right">€{row.original.item_price.toFixed(2)}</div>,
        },
        {
            accessorKey: "quantity",
            header: () => <div className="text-center">{t('quantity')}</div>,
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
            header: () => <div className="text-right">{t('total')}</div>,
            cell: ({ row }) => {
                const item = row.original
                const quantity = localQuantities[item.id] ?? item.quantity
                return <div className="font-semibold text-right">€{(item.item_price * quantity).toFixed(2)}</div>
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

    // Thêm cột select nếu cần
    // if (selectColumn) {
    //     columns.unshift(selectColumn)
    // }

    // Thêm cột actions
    if (isMobile) {
        columns.unshift(actionsColumn)
    } else {
        columns.push(actionsColumn)
    }

    return columns
}
