"use client"

import { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CopyCheck, Eye, Loader2, Pencil } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { ProductItem } from "@/types/products"
import { useState } from "react"
import { useEditProduct } from "@/features/products/hook"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useRemoveFormEbay, useSyncToEbay } from "@/features/ebay/hook"
import { stripHtmlRegex } from "@/hooks/simplifyHtml"
import { Switch } from "@/components/ui/switch"
import DeleteDialog from "./delete-dialog"
import { useLocale } from "next-intl"
import { Link, useRouter } from "@/src/i18n/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { getProductById } from "@/features/products/api"

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
    const syncToEbayMutation = useSyncToEbay()

    const handleEditProductStock = () => {
        console.log('hehe')
        EditProductMutation.mutate({
            input: {
                ...product,
                stock: value,
                ...(product.categories?.length
                    ? { category_ids: product.categories.map(c => c.id) }
                    : {}),
                ...(product.brand?.id ? { brand_id: product.brand.id } : {}),
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
                    className={cn('w-20', EditProductMutation.isPending ? "cursor-wait" : "cursor-text")}
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

function EdittbalePriceCell({ product }: { product: ProductItem }) {
    const [value, setValue] = useState(product.final_price)
    const [editing, setEditing] = useState(false)
    const EditProductMutation = useEditProduct()

    const handleEditProductPrice = () => {
        EditProductMutation.mutate({
            input: {
                ...product,
                final_price: value,
                ...(product.categories?.length
                    ? { category_ids: product.categories.map((c) => c.id) }
                    : {}),
                ...(product.brand?.id ? { brand_id: product.brand.id } : {}),
            },
            id: product.id,
        }, {
            onSuccess(data, variables, context) {
                toast.success("Update product price successful")
                setEditing(false)
            },
            onError(error, variables, context) {
                toast.error("Update product price fail")
            },
        })
    }

    return (
        <div className="text-right flex justify-end">
            {editing ? (
                <Input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.valueAsNumber)}
                    onBlur={() => {
                        if (value !== product.final_price) {
                        } else {
                            setEditing(false)
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleEditProductPrice()
                        }
                        if (e.key === "Escape") {
                            setValue(product.final_price)
                            setEditing(false)
                        }
                    }}
                    autoFocus
                    disabled={EditProductMutation.isPending}
                    className={cn('w-28', EditProductMutation.isPending ? "cursor-wait" : "cursor-text")}
                />
            ) : (
                <div
                    className="cursor-pointer"
                    onClick={() => setEditing(true)}
                >
                    {product.final_price ? <div className="text-right">€{(product.final_price)?.toFixed(2)}</div> : <div className="text-right">Updating</div>}
                </div>
            )}
        </div>
    )
}

function SyncToEbay({ product }: { product: ProductItem }) {
    const syncToEbayMutation = useSyncToEbay()
    const removeFromEbayMutation = useRemoveFormEbay()

    const handleRemoveFromEbay = () => {
        removeFromEbayMutation.mutate(product.sku, {
            onSuccess(data, variables, context) {
                toast.success("Remove from Ebay successful")
            },
            onError(error, variables, context) {
                toast.error("Remove from Ebay fail")
            },
        })
    }

    const handleSyncToEbay = () => {
        syncToEbayMutation.mutate({
            price: product.final_price,
            sku: product.sku,
            stock: product.stock,
            tax: product.tax ? product.tax : null,
            product: {
                description: stripHtmlRegex(product.description),
                title: JSON.stringify(product.name),
                imageUrls: product.static_files?.map(file => file.url) ?? [],
                ean: product.ean ? [product.ean] : [],
            },
            carrier: product.carrier
        }, {
            onSuccess(data, variables, context) {
                toast.success("Sync to Ebay successful")
            },

            onError(error) {
                const message =
                    error.response?.data?.detail?.errors?.[0]?.message ?? "Fail to sync to Ebay"
                toast.error(message)
            },
        })
    }

    return (
        <div className="flex justify-start gap-2">
            <Button onClick={() => handleSyncToEbay()} variant={'outline'} disabled={syncToEbayMutation.isPending || removeFromEbayMutation.isPending}>
                {syncToEbayMutation.isPending ? <Loader2 className="animate-spin" /> : 'Sync'}
            </Button>
            {product.ebay ?
                <Button onClick={() => handleRemoveFromEbay()} variant={'outline'} className="text-red-600 border-red-600" disabled={removeFromEbayMutation.isPending || syncToEbayMutation.isPending}>
                    {syncToEbayMutation.isPending ? <Loader2 className="animate-spin" /> : 'Remove'}
                </Button>
                :
                ''
            }
        </div>
    )
}

function ToogleProductStatus({ product }: { product: ProductItem }) {
    const editProductMutation = useEditProduct()
    const handleToogleStatus = () => {
        editProductMutation.mutate({
            input: {
                ...product,
                is_active: !product.is_active,
                category_ids: product.categories.map((c) => c.id), // map ra id array
                // brand_id: product.brand.id
            },
            id: product.id,
        }, {
            onSuccess(data, variables, context) {
                toast.success("Update product status successful")
            },
            onError(error, variables, context) {
                toast.error("Update product status fail")
            },
        })
    }

    return (
        <Switch
            checked={product.is_active}
            onCheckedChange={handleToogleStatus}
            disabled={editProductMutation.isPending}
            className='data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-secondary cursor-pointer'
        />
    )

}

function ActionsCell({ product }: { product: ProductItem }) {
    const locale = useLocale();
    const router = useRouter();
    const queryClient = useQueryClient();


    const categories = product.categories || [];
    const formatName = (name: string) =>
        name.trim().toLowerCase().replace(/\s+/g, "-");

    const level1 = categories.find((c) => c.level === 1);
    const level2 = categories.find((c) => c.level === 2);

    const handleClick = async (id: string) => {
        try {
            await queryClient.prefetchQuery({
                queryKey: ["product", id],
                queryFn: () => getProductById(id),
            });
            router.push(`/admin/products/${id}/edit`, { locale });
        } catch (err) {
            console.error("Prefetch failed:", err);
            router.push(`/admin/products/${id}/edit`, { locale });
        }
    }

    const categoryHref =
        level1 && level2
            ? `/${formatName(level1.name)}/${formatName(level2.name)}/${product.id}`
            : level1
                ? `/${formatName(level1.name)}/${product.id}`
                : level2
                    ? `/${formatName(level2.name)}/${product.id}`
                    : `/${product.id}`;

    return (
        <div className="flex gap-2">
            {/* <Link href={`/admin/products/${product.id}/edit`}> */}
            <Button variant="ghost" size="icon" onClick={() => handleClick(product.id)}>
                <Pencil className="w-4 h-4 text-primary" />
            </Button>
            {/* </Link> */}
            <DeleteDialog product={product} />
            <Link
                href={`/product${categoryHref}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                <Button variant="ghost" size="icon">
                    <Eye className="w-4 h-4 text-secondary" />
                </Button>
            </Link>
            <Link href={`/admin/products/${product.id}/clone`}>
                <Button variant="ghost" size="icon">
                    <CopyCheck className="w-4 h-4 text-secondary" />
                </Button>
            </Link>
        </div>
    );
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
        cell: ({ row }) => <EditableStockCell product={row.original} />
    },
    {
        accessorKey: "is_active",
        header: "STATUS",
        cell: ({ row }) => (
            // <span
            //     className={`px-2 py-1 rounded-md text-xs ${row.original.is_active ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            //         }`}
            // >
            //     {row.original.is_active ? "active" : "inactive"}
            // </span>
            <ToogleProductStatus product={row.original} />
        ),
    },
    {
        accessorKey: "cost",
        header: () => <div className="text-right">COST</div>,
        cell: ({ row }) => <div className="text-right">{row.original.cost ? <span>€{(row.original.cost).toFixed(2)}</span> : 'Updating ...'}</div>,
    },
    {
        accessorKey: "shipping_cost",
        header: () => <div className="text-right">DELIVERY COST</div>,
        cell: ({ row }) => <div className="text-right">{row.original.delivery_cost ? <>€{(row.original.delivery_cost)?.toFixed(2)}</> : 'Updating ...'}</div>,
    },
    {
        accessorKey: "final_price",
        header: () => <div className="text-right">FINAL PRICE</div>,
        cell: ({ row }) => <EdittbalePriceCell product={row.original} />,
    },
    {
        id: "margin",
        header: () => <div className="text-right">MARGIN</div>,
        cell: ({ row }) => {
            const { final_price, cost, tax } = row.original
            const taxRate = parseFloat(tax) / 100
            if (!final_price || !cost || final_price <= 0) return <div className="text-right">Updating ...</div>

            const margin = ((1 / (1 + taxRate)) - (cost / final_price)) * 100
            return <div className="text-right">{margin.toFixed(1)}%</div>
        }
    },
    {
        id: "carrier",
        header: () => <div className="text-center">CARRIER</div>,
        cell: ({ row }) => {
            const carrier = row.original.carrier?.toLowerCase()

            let image: string | null = null
            if (carrier === "amm") {
                image = "/amm.jpeg"
            } else if (carrier === "dpd") {
                image = "/dpd.jpeg"
            }

            return (
                <div className="flex items-center justify-center">
                    {image ? (
                        <Image
                            src={image}
                            alt={carrier}
                            width={60}
                            height={60}
                            unoptimized
                            className="object-fill"
                        />
                    ) : (
                        <div>
                            Updating ...
                        </div>
                    )}
                </div>
            )
        },
    },
    {
        id: "actions",
        header: "ACTION",
        cell: ({ row }) => <ActionsCell product={row.original} />
    },
    {
        id: 'sync',
        header: "EBAY",
        cell: ({ row }) => {
            return (
                <SyncToEbay product={row.original} />
            )
        }
    }
]
