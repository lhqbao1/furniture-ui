"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CartItem } from "@/types/cart"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, Trash } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { useMediaQuery } from "react-responsive"
import { ProductItem } from "@/types/products"
import { useAddToWishList } from "@/features/wishlist/hook"
import { toast } from "sonner"
import { HandleApiError } from "@/lib/api-helper"
import { useIsMobile } from "@/hooks/use-mobile"
import { CartTableItem } from "./cart-local-table"
import { useCartLocal } from "@/hooks/cart"

// interface GetCartLocalColumnsProps {
//     localQuantities: Record<string, number>
//     localStatuses: Record<string, boolean>
//     onUpdateQuantity: (item: CartItem, newQuantity: number) => void
//     onDeleteItem: (item: CartItem) => void
//     onToggleSelect: (item: CartItem, checked: boolean) => void
//     isCheckout?: boolean
// }

export const GetCartLocalColumns = (): ColumnDef<CartTableItem>[] => {
    const t = useTranslations()
    const isMobile = useIsMobile()
    const { updateQuantity } = useCartLocal()
    const { removeItem } = useCartLocal()
    const onUpdateQuantity = (item: CartTableItem, newQuantity: number) => {
        if (newQuantity < 1) return
        if (item.stock && newQuantity > item.stock) return
        updateQuantity({ product_id: item.product_id, quantity: newQuantity })
    }

    // =====================
    // MOBILE (card layout)
    // =====================
    if (isMobile) {
        return [
            {
                id: "mobile",
                header: () => <span />,
                cell: ({ row }) => {
                    const item = row.original
                    return (
                        <div className="flex flex-col gap-3.5 p-3 flex-wrap">
                            {/* Hàng 1 */}
                            <div className="flex items-center gap-3 justify-between w-fit text-wrap flex-wrap">
                                <div className="flex items-center gap-3 max-w-[300px] lg:max-w-full">
                                    <Image
                                        src={item.img_url || "/1.png"}
                                        alt={item.product_name}
                                        width={60}
                                        height={60}
                                        className="rounded shrink-0"
                                        unoptimized
                                    />
                                    <p className="font-semibold text-wrap">{item.product_name}</p>
                                </div>
                            </div>

                            {/* Hàng 2 */}
                            <div className="flex justify-end items-center text-sm gap-6">
                                {/* <span>€{item.item_price.toFixed(2)}</span> */}
                                <span className="font-semibold">
                                    €{(item.item_price * item.quantity).toFixed(2)}
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onUpdateQuantity(item, item.quantity - 1)}
                                    >
                                        -
                                    </Button>
                                    <span>{item.quantity}</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onUpdateQuantity(item, item.quantity + 1)}
                                        disabled={item.quantity >= item.stock}
                                    >
                                        +
                                    </Button>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <Trash
                                        className="text-red-500 cursor-pointer"
                                        onClick={() => removeItem(item.product_id)}
                                        size={20}
                                    />
                                </div>
                            </div>
                        </div>
                    )
                },
            },
        ]
    }

    // =====================
    // DESKTOP (table layout)
    // =====================
    const baseColumns: ColumnDef<CartTableItem>[] = [
        {
            accessorKey: "product_name",
            header: () => <div className="">{t('product')}</div>,
            cell: ({ row }) => (
                <div className="flex items-center gap-2 w-80 text-wrap">
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
            header: () => <div className="text-center">{t('quantity')}</div>,
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
            header: () => <div className="text-right">{t('price')}</div>,
            cell: ({ row }) => (
                <div className="text-right">€{(row.original.item_price * row.original.quantity).toFixed(2)}</div>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-right">{t('actions')}</div>,
            cell: ({ row }) => {
                const item = row.original
                return (
                    <div className="flex justify-end">
                        <Trash className="text-red-500 cursor-pointer"
                            onClick={() => removeItem(item.product_id ?? '')} size={20} />
                    </div>
                )
            },
        },
    ]

    return baseColumns
}
