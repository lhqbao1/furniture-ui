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
        // cell: ({ row }) => <EditableNameCell product={row.original} />,
        cell: ({ row }) => <div className="w-60 text-wrap">{row.original.name}</div>
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
        // cell: ({ row }) => <EditableStockCell product={row.original} />,
        cell: ({ row }) => <div className="text-center">{row.original.stock} pcs.</div>
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
        accessorKey: "shipping_cost",
        header: () => <div className="text-right">DELIVERY COST</div>,
        cell: ({ row }) => <div className="text-right">{row.original.delivery_cost ? <>€{(row.original.delivery_cost)?.toFixed(2)}</> : 'Updating ...'}</div>,
    },
    {
        accessorKey: "final_price",
        header: () => <div className="text-right">FINAL PRICE</div>,
        cell: ({ row }) => <div className="text-right">€{(row.original.final_price)?.toFixed(2)}</div>,
    },
    {
        id: "margin",
        header: () => <div className="text-right">MARGIN</div>,
        cell: ({ row }) => {
            const { final_price, cost } = row.original
            if (final_price <= 0) return <div className="text-right">N/A</div>

            const profit = final_price - cost
            const margin = profit / final_price // tỷ suất lợi nhuận

            return <div className="text-right">{margin.toFixed(2)}</div>
        }
    },
    {
        id: "carrier",
        header: () => <div className="text-center">CARRIER</div>,
        cell: ({ row }) => <div>{row.original.carrier}</div>
    },
    {
        id: "actions",
        header: "ACTION",
        cell: ({ row }) => {
            // Lấy đường dẫn category
            const product = row.original
            const categories = product.categories || []
            const formatName = (name: string) => name.trim().toLowerCase().replace(/\s+/g, '-')

            const level1 = categories.find(c => c.level === 1)
            const level2 = categories.filter(c => c.level === 2)[0] // level 2 đầu tiên

            const categoryHref = level1 && level2
                ? `/${formatName(level1.name)}/${formatName(level2.name)}/${product.id}`
                : level1
                    ? `/${formatName(level1.name)}/${product.id}`
                    : level2
                        ? `/${formatName(level2.name)}/${product.id}`
                        : `/${product.id}`

            return (
                <div className="flex gap-2">
                    {/* Edit */}
                    <Link href={`/admin/products/${row.original.id}/edit`}>
                        <Button variant="ghost" size="icon">
                            <Pencil className="w-4 h-4 text-primary" />
                        </Button>
                    </Link>

                    {/* Delete */}
                    {/* <DeleteDialog product={row.original} /> */}

                    {/* View */}
                    <Link href={`/product/${categoryHref}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4 text-secondary" />
                        </Button>
                    </Link>
                </div>
            )
        }
    }

]
