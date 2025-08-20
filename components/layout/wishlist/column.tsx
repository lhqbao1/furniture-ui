"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import Image from "next/image"

export type CartItem = {
    id: string
    name: string
    material: string
    sku: string
    unitPrice: number
    oldUnitPrice?: number
    qty: number
    stock: number
    image: string
}

type Actions = {
    onQtyChange: (id: string, nextQty: number) => void
    onRemove?: (id: string) => void
    onBuy?: (id: string) => void
}

export const getColumns = (actions: Actions): ColumnDef<CartItem>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(v) => row.toggleSelected(!!v)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
    },
    {
        accessorKey: "name",
        header: "Items",
        cell: ({ row }) => {
            const it = row.original
            return (
                <div className="flex items-center gap-3">
                    <Image src={it.image} alt={it.name} width={60} height={60} className="rounded" />
                    <div>
                        <p className="font-semibold">{it.name}</p>
                        <p className="text-sm text-muted-foreground">Material: {it.material}</p>
                        <p className="text-xs text-muted-foreground">SKU: {it.sku}</p>
                    </div>
                </div>
            )
        },
    },
    {
        id: "qty",
        header: "Quantity",
        cell: ({ row }) => {
            const it = row.original
            const dec = () => actions.onQtyChange(it.id, Math.max(1, it.qty - 1))
            const inc = () => actions.onQtyChange(it.id, Math.min(it.stock, it.qty + 1))
            return (
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={dec} disabled={it.qty <= 1}>-</Button>
                    <span className="w-8 text-center">{it.qty}</span>
                    <Button variant="outline" size="icon" onClick={inc} disabled={it.qty >= it.stock}>+</Button>
                </div>
            )
        },
        size: 160,
    },
    {
        accessorKey: "unitPrice",
        header: "Unit price",
        cell: ({ row }) => {
            const { unitPrice, oldUnitPrice } = row.original
            return (
                <div>
                    {oldUnitPrice ? (
                        <>
                            <span className="line-through text-gray-400 mr-1">{oldUnitPrice}€</span>
                            <span className="text-red-500 font-semibold">{unitPrice}€</span>
                        </>
                    ) : (
                        <span className="font-semibold">{unitPrice}€</span>
                    )}
                </div>
            )
        },
    },
    {
        id: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const { unitPrice, oldUnitPrice, qty } = row.original
            const newTotal = unitPrice * qty
            const oldTotal = (oldUnitPrice ?? unitPrice) * qty
            return (
                <div>
                    {oldUnitPrice && <span className="line-through text-gray-400 mr-1">{oldTotal}€</span>}
                    <span className="text-red-500 font-semibold">{newTotal}€</span>
                </div>
            )
        },
    },
    {
        accessorKey: "stock",
        header: "In stocks",
        cell: ({ row }) => <span>{row.original.stock} left</span>,
    },
    {
        id: "remove",
        header: "Remove",
        cell: ({ row }) => (
            <Button
                variant="ghost"
                size="icon"
                onClick={() => actions.onRemove?.(row.original.id)}
                aria-label="Remove"
            >
                <Trash2 className="h-4 w-4 text-gray-500" />
            </Button>
        ),
        size: 60,
    },
    {
        id: "buy",
        header: "BUY",
        cell: ({ row }) => (
            <Button
                className="bg-orange-400 hover:bg-orange-500 text-white rounded-full px-4"
                onClick={() => actions.onBuy?.(row.original.id)}
            >
                + BUY
            </Button>
        ),
        size: 120,
    },
]
