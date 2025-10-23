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
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import SyncToEbayForm from "./sync-to-ebay-form"
import { syncToEbayInput } from "@/features/ebay/api"


function ToogleProductStatus({ product }: { product: ProductItem }) {
    const editProductMutation = useEditProduct()
    const handleToogleStatus = () => {
        editProductMutation.mutate({
            input: {
                ...product,
                is_active: !product.is_active,
                category_ids: product.categories.map((c) => c.id), // map ra id array
                // 🔹 Thêm bundles
                ...(product.bundles?.length
                    ? {
                        bundles: product.bundles.map(item => ({
                            product_id: item.bundle_item.id,
                            quantity: item.quantity,
                        })),
                    }
                    : { bundles: [] }),
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

function SyncToMarketplace({ product, marketplace }: { product: ProductItem, marketplace: string }) {
    const syncToEbayMutation = useSyncToEbay()
    const removeFromEbayMutation = useRemoveFormEbay()
    const [openUpdateMarketplaceDialog, setOpenUpdateMarketplaceDialog] = useState<boolean>(false)
    const [updating, setUpdating] = useState<boolean>(false)

    const handleRemoveFromEbay = () => {
        if (marketplace === 'ebay') {
            removeFromEbayMutation.mutate(product.sku, {
                onSuccess(data, variables, context) {
                    toast.success("Remove from Ebay successful")
                },
                onError(error, variables, context) {
                    toast.error("Remove from Ebay fail")
                },
            })
        } else {
            console.log(marketplace)
        }
    }

    const handleSync = () => {
        if (marketplace === 'ebay') {
            const ebayMarketplace = product.marketplace_products?.find(
                (p) => p.marketplace === "ebay"
            )

            const payload: syncToEbayInput = {
                price: product.final_price,
                sku: product.sku,
                stock: product.stock,
                tax: product.tax ? product.tax : null,
                product: {
                    description: stripHtmlRegex(product.description),
                    title: product.name,
                    imageUrls: product.static_files
                        ?.map((file) => file.url.replace(/\s+/g, "%20")) // Đổi khoảng trắng thành %20
                        ?? [],
                    ean: product.ean ? [product.ean] : [],
                },
                carrier: product.carrier,
                brand: product.brand ? product.brand.name : ''
            }

            // ✅ Chỉ thêm min_stock nếu có giá trị thật
            if (ebayMarketplace?.min_stock !== undefined && ebayMarketplace?.min_stock !== null) {
                payload.min_stock = ebayMarketplace.min_stock
            }

            if (ebayMarketplace?.max_stock !== undefined && ebayMarketplace?.max_stock !== null) {
                payload.max_stock = ebayMarketplace.max_stock
            }

            syncToEbayMutation.mutate(payload, {
                onSuccess(data, variables, context) {
                    toast.success("Sync to Ebay successful")
                },

                onError(error) {
                    const message =
                        error.response?.data?.detail?.errors?.[0]?.message ?? "Fail to sync to Ebay"
                    toast.error(message)
                },
            })
        } else {
            console.log(marketplace)
        }
    }

    return (
        <div className="flex justify-start gap-2">
            {product.marketplace_products.length > 0 ? (
                product.marketplace_products.find(m => m.marketplace === marketplace)?.is_active === true ? (
                    <SyncToEbayForm updating={updating} setUpdating={setUpdating} product={product} isUpdating currentMarketplace={marketplace} />
                ) : (
                    <Button
                        onClick={() => handleSync()}
                        variant="outline"
                        disabled={syncToEbayMutation.isPending || removeFromEbayMutation.isPending}
                    >
                        {syncToEbayMutation.isPending ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            "Sync"
                        )}
                    </Button>
                )
            ) : (
                <Button
                    onClick={() => handleSync()}
                    variant="outline"
                    disabled={syncToEbayMutation.isPending || removeFromEbayMutation.isPending}
                >
                    {syncToEbayMutation.isPending ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        "Sync"
                    )}
                </Button>
            )}



            {product.marketplace_products.find(i => i.marketplace === 'ebay') && product.marketplace_products.find(i => i.marketplace === 'ebay')?.is_active === true ?
                <Button onClick={() => handleRemoveFromEbay()} variant={'outline'} className="text-red-600 border-red-600" disabled={removeFromEbayMutation.isPending || syncToEbayMutation.isPending}>
                    {syncToEbayMutation.isPending ? <Loader2 className="animate-spin" /> : 'Remove'}
                </Button>
                :
                ''
            }
        </div>
    )
}

function RemoveFromMarketplace({ product, marketplace }: { product: ProductItem, marketplace: string }) {
    const removeFromEbayMutation = useRemoveFormEbay()

    const handleRemoveFromEbay = () => {
        if (marketplace === 'ebay') {
            removeFromEbayMutation.mutate(product.sku, {
                onSuccess(data, variables, context) {
                    toast.success("Remove from Ebay successful")
                },
                onError(error, variables, context) {
                    toast.error("Remove from Ebay fail")
                },
            })
        } else {
            console.log(marketplace)
        }
    }

    return (
        <Button onClick={() => handleRemoveFromEbay()} variant={'outline'} className="text-red-600 border-red-600" disabled={removeFromEbayMutation.isPending}>
            {removeFromEbayMutation.isPending ? <Loader2 className="animate-spin" /> : 'Remove'}
        </Button>
    )

}

function AddProductMarketplace({ product }: { product: ProductItem }) {
    const [openAddMarketplaceDialog, setOpenAddMarketplaceDialog] = useState<boolean>(false)
    const [updating, setUpdating] = useState<boolean>(false)
    return (
        <div className="flex justify-center">
            <SyncToEbayForm setUpdating={setUpdating} product={product} isUpdating={false} />
        </div>
    )
}


export const baseColumns: ColumnDef<ProductItem>[] = [
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
        header: "IMAGE",
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
        header: ({ column }) => (
            <Button
                variant={'ghost'}
                className="font-semibold flex items-center px-0 justify-center gap-1 w-fit"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                <div>NAME</div>
                <div className="mb-0.5">
                    {{
                        asc: "↑",
                        desc: "↓",
                    }[column.getIsSorted() as string] ?? "↕"}
                </div>
            </Button>
        ),
        // cell: ({ row }) => <EditableNameCell product={row.original} />,
        cell: ({ row }) => <div className="max-w-60 w-60 text-wrap">{row.original.name}</div>,
        enableSorting: true

    },
    {
        accessorKey: "owner",
        header: "SUPPLIER",
        cell: ({ row }) => {
            return (
                <div>{row.original.owner?.business_name ? row.original.owner?.business_name : "Prestige Home"}</div>
            )
        }
    },
    {
        accessorKey: "stock",
        header: () => <div className="text-center">STOCK</div>,
        cell: ({ row }) => <div className="text-center">{row.original.stock} pcs.</div>,
        // cell: ({ row }) => <EditableStockCell product={row.original} />
    },
    {
        accessorKey: "is_active",
        header: "STATUS",
        cell: ({ row }) => (
            <ToogleProductStatus product={row.original} />
        ),
    },
    {
        accessorKey: "final_price",
        header: () => <div className="text-right">FINAL PRICE</div>,
        cell: ({ row }) => <div>{row.original.final_price ? <div className="text-right">€{(row.original.final_price)?.toFixed(2)}</div> : <div className="text-right">updating</div>}
        </div>,
    },
]

export const productMarketplaceColumns = (
    products: ProductItem[]
): ColumnDef<ProductItem>[] => {
    // Lấy danh sách marketplace duy nhất từ toàn bộ product
    const marketplaces = Array.from(
        new Set(
            products
                .flatMap((p) => p.marketplace_products?.map((m) => m.marketplace))
                .filter(Boolean)
        )
    )

    // Cột cố định cho marketplace
    const fixedMarketplaceColumn: ColumnDef<ProductItem> = {
        id: "marketplace",
        header: () => (
            <div className="text-center font-semibold uppercase">MARKETPLACE</div>
        ),
        cell: ({ row }) => {
            const product = row.original
            return <AddProductMarketplace product={product} />
        },
    }

    // Các cột động theo marketplace thực tế
    const dynamicMarketplaceColumns: ColumnDef<ProductItem>[] = marketplaces.map(
        (marketplace) => ({
            id: marketplace,
            header: () => (
                <div className="text-center font-semibold uppercase">
                    {marketplace}
                </div>
            ),
            cell: ({ row }) => {
                const product = row.original
                const hasMarketplace = product.marketplace_products?.some(
                    (m) => m.marketplace === marketplace
                )

                return (
                    <div
                        className={`flex justify-center text-center text-sm font-medium 
                            }`}
                    >
                        {hasMarketplace ? (
                            product.is_active ? (
                                // ✅ Có marketplace + active → hiển thị nút Sync
                                <SyncToMarketplace product={product} marketplace={marketplace} />
                            ) : (
                                // ✅ Có marketplace + inactive → hiển thị nút Remove
                                <div className="text-center">Product is inactive</div>
                            )
                        ) : !product.is_active ? (
                            // ❌ Không có marketplace + inactive
                            <div className="text-center">Product is inactive</div>
                        ) : (
                            // ❌ Không có marketplace + active
                            <div className="text-center">No {marketplace} data</div>
                        )}


                    </div>
                )
            },
        })
    )

    return [...baseColumns, fixedMarketplaceColumn, ...dynamicMarketplaceColumns]
}

