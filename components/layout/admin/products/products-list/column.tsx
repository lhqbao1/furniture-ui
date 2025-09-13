"use client"

import { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Eye, Pencil } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import DeleteDialog from "./delete-dialog"
import { ProductItem } from "@/types/products"
import Link from "next/link"
import { useState } from "react"
import { useEditProduct } from "@/features/products/hook"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

function EditableNameCell({ product }: { product: ProductItem }) {
    const [value, setValue] = useState(product.name)
    const [editing, setEditing] = useState(false)
    const EditProductMutation = useEditProduct()

    const handleEditProductName = () => {
        EditProductMutation.mutate({
            input: {
                ...product,
                name: value,
                category_ids: product.categories.map((c) => c.id),
                brand_id: product.brand.id
            },
            id: product.id,
        }, {
            onSuccess(data, variables, context) {
                toast.success("Update product name successful")
                setEditing(false)
            },
            onError(error, variables, context) {
                toast.error("Update product name fail")
            },
        })
    }

    return (
        <div className="w-60 text-wrap">
            {editing ? (
                <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={() => {
                        if (value !== product.name) {
                        } else {
                            setEditing(false)
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleEditProductName()
                        }
                        if (e.key === "Escape") {
                            setValue(product.name)
                            setEditing(false)
                        }
                    }}
                    autoFocus
                    disabled={EditProductMutation.isPending}
                    className={cn(EditProductMutation.isPending ? "cursor-wait" : "cursor-text")}
                />
            ) : (
                <div
                    className="cursor-pointer"
                    onClick={() => setEditing(true)}
                >
                    {product.name}
                </div>
            )}
        </div>
    )
}

function EditableStockCell({ product }: { product: ProductItem }) {
    const [value, setValue] = useState(product.stock)
    const [editing, setEditing] = useState(false)
    const EditProductMutation = useEditProduct()

    const handleEditProductStock = () => {
        EditProductMutation.mutate({
            input: {
                ...product,
                stock: value,
                category_ids: product.categories.map((c) => c.id), // map ra id array
                brand_id: product.brand.id
            },
            id: product.id,
        }, {
            onSuccess(data, variables, context) {
                toast.success("Update product stock successful")
                setEditing(false)
            },
            onError(error, variables, context) {
                toast.error("Update product stock fail")
            },
        })
    }

    return (
        <div className="">
            {editing ? (
                <Input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.valueAsNumber)}
                    onBlur={() => {
                        if (value !== product.stock) {
                        } else {
                            setEditing(false)
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleEditProductStock()
                        }
                        if (e.key === "Escape") {
                            setValue(product.stock)
                            setEditing(false)
                        }
                    }}
                    autoFocus
                    disabled={EditProductMutation.isPending}
                    className={cn(EditProductMutation.isPending ? "cursor-wait" : "cursor-text")}
                />
            ) : (
                <div
                    className="cursor-pointer"
                    onClick={() => setEditing(true)}
                >
                    {product.stock} pcs.
                </div>
            )}
        </div>
    )
}


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
                        <Image src={image} alt="icon" fill className="object-cover rounded-md" sizes="60px" unoptimized
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
        cell: ({ row }) => <EditableNameCell product={row.original} />,

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
        cell: ({ row }) => <EditableStockCell product={row.original} />,
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
        header: () => <div className="text-right">COST</div>,
        cell: ({ row }) => <div className="text-right">€{(row.original.cost).toFixed(2)}</div>,
    },
    {
        accessorKey: "discount_amount",
        header: () => <div className="text-right">DISCOUNT</div>,
        cell: ({ row }) => <div className="text-right">€{(row.original.discount_amount)?.toFixed(2)}</div>,
    },
    {
        accessorKey: "final_price",
        header: () => <div className="text-right">FINAL PRICE</div>,
        cell: ({ row }) => <div className="text-right">€{(row.original.final_price)?.toFixed(2)}</div>,
    },
    {
        id: "revenue",
        header: () => <div className="text-right">REVENUE</div>,
        cell: ({ row }) => <div className="text-right">€{(row.original.final_price - (row.original.cost ?? 0)).toFixed(2)}</div>,
    },
    {
        id: "default",
        header: () => <div className="flex justify-center"><Image src="/new-logo.svg" alt="default" width={30} height={30} unoptimized /></div>,
        cell: () => <div className="text-center"><Switch className='data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-secondary cursor-pointer' /></div>,
    },
    {
        id: "amazon",
        header: () => <div className="flex justify-center"><Image src="/amazon.png" alt="default" width={56} height={36} unoptimized /></div>,
        cell: () => <div className="text-center"><Switch className='data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-primary cursor-pointer' /></div>,
    },
    {
        id: "ebay",
        header: () => <div className="flex justify-center"><Image src="/ebay.png" alt="default" width={56} height={36} unoptimized /></div>,
        cell: () => <div className="text-center"><Switch className='data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-[#0064D4] cursor-pointer' /></div>,
    },
    {
        id: "kaufland",
        header: () => <div className="flex justify-center"><Image src="/kau.png" alt="default" width={64} height={36} unoptimized /></div>,
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
                    <Link href={`/product/${categoryHref}`}>
                        <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4 text-secondary" />
                        </Button>
                    </Link>
                </div>
            )
        }
    }

]
