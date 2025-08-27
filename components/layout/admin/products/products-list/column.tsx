"use client"

import { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { Products } from "@/lib/schema/product"
import { Checkbox } from "@/components/ui/checkbox"

export const productColumns: ColumnDef<Products>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "static_files",
        header: "ICON",
        cell: ({ row }) => {
            const image = row.original.static_files?.[0]?.url
            return (
                <div className="w-12 h-12 relative">
                    {image ? (
                        <Image src={image} alt="icon" fill className="object-cover rounded-md" />
                    ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-md" />
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: "name",
        header: "NAME",
    },
    {
        accessorKey: "category",
        header: "CATEGORY",
    },
    {
        accessorKey: "stock",
        header: "STOCK",
        cell: ({ row }) => <span>{row.original.stock} pcs.</span>,
    },
    {
        accessorKey: "is_active",
        header: "STATUS",
        cell: ({ row }) => (
            <span
                className={`px-2 py-1 rounded-md text-xs ${row.original.is_active ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}
            >
                {row.original.is_active ? "active" : "inactive"}
            </span>
        ),
    },
    {
        accessorKey: "price",
        header: "COST",
        cell: ({ row }) => <>€{(row.original.price).toFixed(2)}</>,
    },
    {
        accessorKey: "discount_amount",
        header: "DISCOUNT",
        cell: ({ row }) => <>€{(row.original.discount_amount)?.toFixed(2)}</>,
    },
    {
        accessorKey: "final_price",
        header: "FINAL PRICE",
        cell: ({ row }) => <>€{(row.original.final_price)?.toFixed(2)}</>,
    },
    {
        id: "revenue",
        header: "REVENUE",
        cell: () => <>€184.000</>, // fake since not in API
    },
    {
        id: "amazon",
        header: () => <Image src="/amazon.png" alt="amazon" width={24} height={24} />,
        cell: () => <Switch />,
    },
    {
        id: "ebay",
        header: () => <Image src="/ebay.png" alt="ebay" width={24} height={24} />,
        cell: () => <Switch />,
    },
    {
        id: "kaufland",
        header: () => <Image src="/kaufland.png" alt="kaufland" width={24} height={24} />,
        cell: () => <Switch />,
    },
    {
        id: "other",
        header: "Other",
        cell: () => <Switch />,
    },
    {
        id: "actions",
        header: "ACTION",
        cell: () => (
            <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                    <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                    <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
            </div>
        ),
    },
]
