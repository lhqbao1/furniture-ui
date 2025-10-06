'use client'

import { ColumnDef } from "@tanstack/react-table"
import { useTranslations } from "next-intl"
import { CartItem } from "@/types/cart"

export function useMyOrderTableColumns(): ColumnDef<CartItem>[] {
    const t = useTranslations()

    return [
        {
            accessorKey: "product_name",
            header: t("product"), // ví dụ: "Product"
            cell: ({ row }) => (
                <div>{row.original.products.name}</div>
            ),
        },
        {
            accessorKey: "quantity",
            header: () => <div>{t("quantity")}</div>,
            cell: ({ row }) => (
                <div>{row.original.quantity}</div>
            ),
        },
        {
            accessorKey: "product_price",
            header: () => <div className="text-right">{t("total")}</div>,
            cell: ({ row }) => (
                <div className="text-right">€{(row.original.item_price * row.original.quantity).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            ),
        },
    ]
}
