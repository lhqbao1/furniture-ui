"use client"
import { ColumnDef } from "@tanstack/react-table"
import { CartItem } from "@/types/cart"
import { Button } from "@/components/ui/button"
import { Heart, Trash } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { ProductItem } from "@/types/products"
import { useAddToWishList } from "@/features/wishlist/hook"
import { toast } from "sonner"
import { HandleApiError } from "@/lib/api-helper"
import { useIsMobile } from "@/hooks/use-mobile"
import { useDeleteCartItem } from "@/features/cart/hook"

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
    localStatuses,
}: GetCartColumnsProps): ColumnDef<CartItem>[] => {
    const t = useTranslations()
    const isMobile = useIsMobile()
    const addToWishlistMutation = useAddToWishList()
    const removeItemFromCartMutation = useDeleteCartItem()

    const handleAddToWishlist = (currentProduct: ProductItem, deleteItem: CartItem) => {
        if (!currentProduct) return
        addToWishlistMutation.mutate(
            { productId: currentProduct.id ?? "", quantity: 1 },
            {
                onSuccess() {
                    toast.success(t("addToWishlistSuccess"))
                    onDeleteItem(deleteItem) // Cast to CartItem to match the function signature
                },
                onError(error) {
                    const { message } = HandleApiError(error, t)
                    toast.error(message)
                },
            }
        )
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
                    const quantity = localQuantities[item.id] ?? item.quantity

                    return (
                        <div className="flex flex-col gap-3.5 p-3">
                            {/* Hàng 1 */}
                            <div className="flex items-center gap-3 justify-between">
                                <div className="flex items-center gap-3 max-w-[300px] lg:max-w-full">
                                    <Image
                                        src={item.image_url || "/1.png"}
                                        alt={item.products.name}
                                        width={60}
                                        height={60}
                                        className="rounded shrink-0"
                                        unoptimized
                                    />
                                    <p className="font-semibold text-wrap line-clamp-3">{item.products.name}</p>
                                </div>
                            </div>

                            {/* Hàng 2 */}
                            <div className="flex justify-end items-center text-sm gap-6">
                                <span className="font-semibold">
                                    €{(item.item_price * quantity).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onUpdateQuantity(item, quantity - 1)}
                                    >
                                        -
                                    </Button>
                                    <span>{quantity}</span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onUpdateQuantity(item, quantity + 1)}
                                        disabled={quantity >= item.products.stock}
                                    >
                                        +
                                    </Button>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <Trash
                                        className="text-red-500 cursor-pointer"
                                        onClick={() => onDeleteItem(item)}
                                        size={20}
                                    />
                                    {isCheckout && (
                                        <Heart
                                            className="text-secondary cursor-pointer"
                                            onClick={() => handleAddToWishlist(item.products, item)}
                                            size={20}
                                        />
                                    )}
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
    const columns: ColumnDef<CartItem>[] = [
        {
            accessorKey: "product_name",
            header: t("product"),
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
                            <p className="font-semibold break-words line-clamp-3">
                                {item.products.name}
                            </p>
                            <p>#{item.products.id_provider}</p>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "item_price",
            header: () => <div className="text-right">{t("price")}</div>,
            cell: ({ row }) => (
                <div className="font-semibold text-right">
                    €{row.original.item_price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
            ),
        },
        {
            accessorKey: "quantity",
            header: () => <div className="text-center">{t("quantity")}</div>,
            cell: ({ row }) => {
                const item = row.original
                const quantity = localQuantities[item.id] ?? item.quantity
                return (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateQuantity(item, quantity - 1)}
                        >
                            -
                        </Button>
                        <span className="px-2">{quantity}</span>
                        <Button
                            type="button"
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
            header: () => <div className="text-right">{t("total")}</div>,
            cell: ({ row }) => {
                const item = row.original
                const quantity = localQuantities[item.id] ?? item.quantity
                return (
                    <div className="font-semibold text-right">
                        €{(item.item_price * quantity).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                )
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const item = row.original
                return (
                    <div className="flex justify-end gap-2">
                        <Trash
                            className="text-red-500 cursor-pointer"
                            onClick={() => onDeleteItem(item)}
                            size={20}
                        />
                        {isCheckout && (
                            <Heart
                                className="text-secondary cursor-pointer"
                                onClick={() => handleAddToWishlist(item.products, item)}
                                size={20}
                            />
                        )}
                    </div>
                )
            },
        },
    ]

    return columns
}

export const cartSupplierColumn: ColumnDef<CartItem>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => {
            return (
                <div>#{row.original.products.id_provider}</div>
            )
        }
    },
    {
        accessorKey: "sku",
        header: () => <div className="text-center">SKU</div>,
        cell: ({ row }) => {
            return (
                <div className="text-center">{row.original.products.sku}</div>
            )
        }
    },
    {
        accessorKey: "ean",
        header: () => <div className="text-center">EAN</div>,
        cell: ({ row }) => {
            return (
                <div className="text-center">{row.original.products.ean}</div>
            )
        }
    },
    {
        accessorKey: "quantity",
        header: () => <div className="text-center">QUANTITY</div>,
        cell: ({ row }) => {
            return (
                <div className="text-center">{row.original.quantity}</div>
            )
        }
    },

    {
        accessorKey: "unit_price",
        header: () => (
            <div className="text-right w-full">UNIT PRICE</div>
        ),
        cell: ({ row }) => <div className="text-right">€{row.original.item_price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>,
    },

    {
        accessorKey: "price",
        header: () => (
            <div className="text-right w-full">PRICE</div>
        ),
        cell: ({ row }) => {
            return (
                <div className="text-right">€{row.original.final_price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            )
        },
    },

]
