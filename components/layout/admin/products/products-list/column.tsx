"use client"

import { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import DeleteDialog from "./delete-dialog"
import { ProductItem } from "@/types/products"
import Link from "next/link"


export const productColumns: ColumnDef<ProductItem>[] = [
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
                        <Image src={image} alt="icon" fill className="object-cover rounded-md" sizes="60px"
                        />
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
        header: () => <Image src="/amazon.png" alt="amazon" width={24} height={24} className="w-auto h-auto" />,
        cell: () => <Switch />,
    },
    {
        id: "ebay",
        header: () => <Image src="/ebay.png" alt="ebay" width={24} height={24} className="w-auto h-auto" />,
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
        cell: ({ row }) => {
            return (

                <div className="flex gap-2">
                    <Link href={`/admin/products/${row.original.id}/edit`}>
                        <Button variant="ghost" size="icon">
                            <Pencil className="w-4 h-4" />
                        </Button>
                    </Link>
                    <DeleteDialog product={row.original} />
                </div>

            )
        }
    },
]
