"use client"

import React, { useState, useCallback } from "react"
import { debounce } from "lodash"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { ColumnDef, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, flexRender } from "@tanstack/react-table"
import { GetWishlistColumns } from "./column"
import CartTableSkeleton from "../cart/table-skeleton"
import { WishListItem, WishListResponse } from "@/types/wishlist"
import { useAddWishlistItemToCart, useAddWishlistToCart, useRemoveWishlistItem, useUpdateWishlistItemQuantity, useUpdateWishlistItemStatus } from "@/features/wishlist/hook"
import { ArrowLeft, Trash } from "lucide-react"
import { Checkbox } from "@radix-ui/react-checkbox"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import Link from "next/link"

interface WishlistTableProps {
    wishlist?: WishListResponse
    isLoadingWishlist?: boolean
    isCheckout?: boolean
    localQuantities: Record<string, number>
    setLocalQuantities: React.Dispatch<React.SetStateAction<Record<string, number>>>
    total: number
    currentTable?: string
}

const WishlistTable = ({ wishlist, isLoadingWishlist, isCheckout = false, localQuantities, setLocalQuantities, total, currentTable }: WishlistTableProps) => {
    const [localStatuses, setLocalStatuses] = useState<Record<string, boolean>>({})
    const [barStyle, setBarStyle] = React.useState<React.CSSProperties>({})
    const t = useTranslations()

    const router = useRouter()
    const updateWishlistItemQuantityMutation = useUpdateWishlistItemQuantity()
    const deleteWishlistItemMutation = useRemoveWishlistItem()
    const updateWishlistItemStatusMutation = useUpdateWishlistItemStatus()
    const addItemToWishlistMutation = useAddWishlistItemToCart()
    const addWishlistToCartMutation = useAddWishlistToCart()

    // const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({})
    const [rowSelection, setRowSelection] = useState({})

    // ✅ debounce API update
    const debouncedUpdate = useCallback(
        debounce((itemId: string, quantity: number) => {
            updateWishlistItemQuantityMutation.mutate(
                { itemId, quantity },
            )
        }, 400),
        []
    )

    const handleToggleSelect = (item: WishListItem, is_active: boolean) => {
        // update local state
        setLocalStatuses((prev) => ({
            ...prev,
            [item.id]: is_active,
        }))

        // call api update cart item status for checkout
        updateWishlistItemStatusMutation.mutate(
            { itemId: item.id, is_active },
        )
    }

    const handleUpdateWishlistItemQuantity = (item: WishListItem, newQuantity: number) => {
        if (newQuantity <= 0) {
            deleteWishlistItemMutation.mutate({ itemId: item.id })
            return
        }

        if (newQuantity > item.products.stock) {
            toast.error(t("notEnoughStock"))
            return
        }

        setLocalQuantities((prev) => ({ ...prev, [item.id]: newQuantity }))
        debouncedUpdate(item.id, newQuantity)
    }

    const handleDeleteItem = (item: WishListItem) => {
        deleteWishlistItemMutation.mutate({ itemId: item.id }, {
            onSuccess: () => toast.success(t("removeItemWishlistSuccess")),
            onError: () => toast.error(t("removeItemWishlistFail")),
        })
    }

    const handleAddToCart = (item: WishListItem) => {
        addItemToWishlistMutation.mutate({ itemId: item.id }, {
            onSuccess: () => toast.success(t("addToCartSuccess")),
            onError: () => toast.error(t("addToCartFail")),
        })
    }

    const handleAddWishlistToCart = (wishlistId: string) => {
        addWishlistToCartMutation.mutate({ wishlistId: wishlistId }, {
            onSuccess: () => {
                toast.success(t("addToCartSuccess"))
                router.push('/cart')
            },
            onError: () => toast.error(t("addToCartFail")),
        })
    }

    const columns = GetWishlistColumns({
        localQuantities,
        onUpdateQuantity: handleUpdateWishlistItemQuantity,
        onAddToCart: handleAddToCart,
        onDeleteItem: handleDeleteItem,
        onToggleSelect: handleToggleSelect,
        isCheckout: isCheckout,
        localStatuses,
    })

    const table = useReactTable({
        data: wishlist?.items ?? [],
        columns,
        state: { rowSelection },
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            sorting: [{ id: "is_active", desc: true }],
        },
    })

    return (
        <div className="col-span-12 md:col-span-8 flex-1">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold mb-6">{currentTable ? currentTable : 'Shopping Cart'}</h2>
                <p className="text-xl font-bold mb-6">({wishlist?.items.length} {t('items')})</p>
            </div>

            <Table>
                <TableHeader className="border-t">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>

                {isLoadingWishlist ? (
                    <TableBody>
                        <CartTableSkeleton />
                    </TableBody>
                ) : (
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {t('noItems')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                )}
            </Table>

            {/* Footer action bar */}
            <div className="sticky bottom-0 lg:mt-12 bg-secondary text-white p-4 rounded-lg" style={barStyle}>
                <div className="grid grid-cols-12 gap-4 bg-secondary text-white rounded-lg">
                    <div className="xl:col-span-7 col-span-12 flex justify-between">
                        <div className="space-y-3">
                            <div className="flex flex-col gap-3 justify-between">
                                <Link href={'/shop-all'} className="flex gap-2 items-center">
                                    <ArrowLeft size={20} />
                                    <span className="text-sm">{t('continueShopping')}</span>
                                </Link>
                            </div>

                            <div className="flex flex-col gap-3 justify-between">
                                <div
                                    className="text-white flex gap-1 cursor-pointer p-0 items-center text-sm"
                                >
                                    <Trash size={20} />
                                    {t('removeOutOfStockProducts')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="xl:col-span-5 col-span-12 flex gap-6 xl:justify-end justify-center">
                        <div className="text-right text-xl">
                            <p className="font-semibold">
                                {t('total')} ({wishlist?.items.length} {t('items')}) <span className="font-bold">€{total.toFixed(2)}</span>
                            </p>
                        </div>
                        <Button className="bg-primary/90 hover:bg-primary cursor-pointer text-white rounded-full px-10 py-2 relative" onClick={() => handleAddWishlistToCart(wishlist?.id ?? '')}>
                            <span className="font-bold">{t('addToCart')}</span>
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default WishlistTable
