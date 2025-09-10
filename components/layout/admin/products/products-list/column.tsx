"use client"

import { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Eye, Pencil } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import DeleteDialog from "./delete-dialog"
import { NewProductItem } from "@/types/products"
import Link from "next/link"


export const productColumns: ColumnDef<NewProductItem>[] = [
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
        cell: ({ row }) => {
            return (
                <div className="w-46 text-wrap">{row.original.name}</div>
            )
        }
    },
    {
        accessorKey: "category",
        header: "CATEGORY",
        cell: ({ row }) => {
            return (
                <div className="flex flex-col gap-1 items-center">
                    {row.original.categories.map((item, indx) => {
                        return (
                            <div key={item.id}>
                                {item.name}
                            </div>
                        )
                    })}
                </div>
            )
        }
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
        accessorKey: "cost",
        header: "COST",
        cell: ({ row }) => <>€{(row.original.cost).toFixed(2)}</>,
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
        cell: ({ row }) => <div>€{(row.original.final_price - (row.original.cost ?? 0)).toFixed(2)}</div>, // fake since not in API
    },
    {
        id: "default",
        header: () => <div className="flex justify-center"><Image src="/new-logo.svg" alt="default" width={30} height={30} /></div>,
        cell: () => <div className="text-center"><Switch className='data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-secondary cursor-pointer' /></div>,
    },
    {
        id: "amazon",
        header: () => <div className="flex justify-center"><Image src="/amazon.png" alt="default" width={56} height={36} /></div>,
        cell: () => <div className="text-center"><Switch className='data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-primary cursor-pointer' /></div>,
    },
    {
        id: "ebay",
        header: () => <div className="flex justify-center"><Image src="/ebay.png" alt="default" width={56} height={36} /></div>,
        cell: () => <div className="text-center"><Switch className='data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-[#0064D4] cursor-pointer' /></div>,
    },
    {
        id: "kaufland",
        header: () => <div className="flex justify-center"><Image src="/kau.png" alt="default" width={64} height={36} /></div>,
        cell: () => <div className="text-center"><Switch className='data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-[#C40809] cursor-pointer' /></div>,
    },
    {
        id: "actions",
        header: "ACTION",
        cell: ({ row }) => {
            // Lấy đường dẫn category
            const categories = row.original.categories || []
            const level1 = categories.find(c => c.level === 1)
            const level2 = categories.filter(c => c.level === 2)[0] // level 2 đầu tiên
            const categoryHref = level1 && level2
                ? `/${level1.name}/${level2.name}/${row.original.id}`
                : level1
                    ? `/${level1.name}/${row.original.id}`
                    : level2
                        ? `/${level2.name}/${row.original.id}`
                        : `/${row.original.id}`

            return (
                <div className="flex gap-2">
                    {/* Edit */}
                    <Link href={`/admin/products/${row.original.id}/edit`}>
                        <Button variant="ghost" size="icon">
                            <Pencil className="w-4 h-4 text-primary" />
                        </Button>
                    </Link>

                    {/* Delete */}
                    <DeleteDialog product={row.original} />

                    {/* View */}
                    <Link href={categoryHref}>
                        <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4 text-secondary" />
                        </Button>
                    </Link>
                </div>
            )
        }
    }

]
