"use client"

import React, { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { marketPlaceSchema } from "@/lib/schema/product"
import { MarketplaceProduct, ProductItem } from "@/types/products"
import { useEditProduct } from "@/features/products/hook"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useSyncToEbay } from "@/features/ebay/hook"
import { syncToEbayInput } from "@/features/ebay/api"
import { stripHtmlRegex } from "@/hooks/simplifyHtml"
import RichEditor from "@/components/shared/tiptap/tiptap-editor"

interface SyncToEbayFormProps {
    product: ProductItem
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    isUpdating?: boolean
    currentMarketplace?: string
    updating?: boolean
    setUpdating: React.Dispatch<React.SetStateAction<boolean>>
}

type MarketPlaceFormValues = z.infer<typeof marketPlaceSchema>

const SyncToEbayForm = ({ product, open, setOpen, isUpdating = false, currentMarketplace, updating, setUpdating }: SyncToEbayFormProps) => {
    const updateProductMutation = useEditProduct()
    const syncToEbayMutation = useSyncToEbay()
    // Danh sách marketplace khả dụng
    const ALL_MARKETPLACES = ["ebay", "amazon", "kaufland"]

    const existingMarketplaces = useMemo(
        () => product.marketplace_products?.map((m) => m.marketplace) ?? [],
        [product]
    )

    const availableMarketplaces = useMemo(
        () => ALL_MARKETPLACES.filter((m) => !existingMarketplaces.includes(m)),
        [existingMarketplaces]
    )

    const marketplacesToRender = useMemo(
        () => (isUpdating ? ALL_MARKETPLACES : availableMarketplaces),
        [isUpdating, availableMarketplaces]
    )




    const form = useForm<MarketPlaceFormValues>({
        resolver: zodResolver(marketPlaceSchema),
        defaultValues: {
            marketplace: currentMarketplace ?? '',
            name: product.name,
            description: product.description,
            final_price: product.final_price,
            min_stock: isUpdating ? product.marketplace_products.find(i => i.marketplace === currentMarketplace)?.min_stock : undefined,
            max_stock: isUpdating ? product.marketplace_products.find(i => i.marketplace === currentMarketplace)?.max_stock : undefined,
            sku: product.sku,
        },
    })

    const marketplace = form.watch("marketplace")

    useEffect(() => {
        if (isUpdating) return
        if (marketplace === "ebay") {
            form.setValue("min_stock", 0)
            form.setValue("max_stock", 10)
        } else {
            form.setValue("min_stock", null)
            form.setValue("max_stock", null)
        }

    }, [marketplace, form])

    const onSubmit = (values: MarketPlaceFormValues) => {
        setUpdating(true)
        const normalizedValues: MarketplaceProduct = {
            ...values,
            marketplace: values.marketplace ?? '',
            final_price: values.final_price ?? 0,
            min_stock: values.min_stock ?? 0,
            max_stock: values.max_stock ?? 0,
            current_stock: values.current_stock ?? 0,
            line_item_id: values.line_item_id ?? "",
            is_active: values.is_active ?? false,
            marketplace_offer_id: values.marketplace_offer_id ?? "",
            name: values.name ?? "",
            description: values.description ?? '',
            sku: values.sku ?? '',
            brand: product.brand ? product.brand.name : ''
        }

        const updatedMarketplaceProducts = [...(product.marketplace_products || [])]

        if (isUpdating) {
            const index = updatedMarketplaceProducts.findIndex(
                (m) => m.marketplace === values.marketplace
            )

            const updateValues = {
                ...normalizedValues,
                is_active: updatedMarketplaceProducts[index].is_active,
                marketplace_offer_id: updatedMarketplaceProducts[index].marketplace_offer_id,
                line_item_id: updatedMarketplaceProducts[index].line_item_id,
                brand: updatedMarketplaceProducts[index].brand,
            }


            if (index !== -1) {
                updatedMarketplaceProducts[index] = {
                    ...updatedMarketplaceProducts[index],
                    ...updateValues,
                }
            } else {
                updatedMarketplaceProducts.push(normalizedValues)
            }
        } else {
            updatedMarketplaceProducts.push(normalizedValues)
        }

        updateProductMutation.mutate(
            {
                input: {
                    ...product,
                    category_ids: product.categories.map((c) => c.id),
                    marketplace_products: updatedMarketplaceProducts,
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
            },
            {
                onSuccess(data) {
                    if (isUpdating && currentMarketplace === 'ebay') {
                        const ebayData = data.marketplace_products?.find(
                            (m) => m.marketplace === "ebay"
                        )
                        const payload: syncToEbayInput = {
                            price: ebayData?.final_price ?? product.final_price,
                            sku: ebayData?.sku ?? product.sku,
                            stock: product.stock,
                            tax: product.tax ? product.tax : null,
                            product: {
                                description: stripHtmlRegex(ebayData?.description ?? product.description),
                                title: ebayData?.name ?? product.name,
                                imageUrls: product.static_files
                                    ?.map((file) => file.url.replace(/\s+/g, "%20")) // Đổi khoảng trắng thành %20
                                    ?? [],
                                ean: product.ean ? [product.ean] : [],
                            },
                            carrier: product.carrier,
                            brand: product.brand ? product.brand.name : '',
                            ...(ebayData?.min_stock !== undefined && { min_stock: ebayData.min_stock }),
                            ...(ebayData?.max_stock !== undefined && { max_stock: ebayData.max_stock }),
                        }
                        syncToEbayMutation.mutate(payload, {
                            onSuccess(data, variables, context) {
                                setOpen(false)
                                toast.success("Update data to ebay successfully")
                                setUpdating(false)
                            },
                            onError(error, variables, context) {
                                toast.error("Update data to ebay fail")
                            },
                        })
                    }
                    toast.success(
                        isUpdating
                            ? "Marketplace data updated successfully"
                            : "Marketplace data created successfully"
                    )
                },
                onError() {
                    toast.error("Failed to update marketplace data")
                },
            }
        )
    }


    return (
        <div className="mx-auto space-y-6">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    {/* Marketplace */}
                    {isUpdating ? "" :
                        <FormField
                            control={form.control}
                            name="marketplace"
                            render={({ field }) => {

                                return (
                                    <FormItem>
                                        <FormLabel>Marketplace</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                            <FormControl>
                                                <SelectTrigger className="border">
                                                    <SelectValue placeholder="Select a marketplace" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {marketplacesToRender.length > 0 ? (
                                                    marketplacesToRender.map((m) => (
                                                        <SelectItem key={m} value={m}>
                                                            {m.toUpperCase()}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="px-3 py-2 text-sm text-muted-foreground">
                                                        All marketplaces added
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                    }


                    {/* Name */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter product name"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Price + Stock */}
                    <div className="grid grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="final_price"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Final Price (€)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min={0}
                                            value={field.value ?? ""}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === ""
                                                        ? null
                                                        : e.target.valueAsNumber
                                                )
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="min_stock"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Min Stock</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={field.value ?? ""}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === ""
                                                        ? null
                                                        : e.target.valueAsNumber
                                                )
                                            }
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="max_stock"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Max Stock</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={field.value ?? ""}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === ""
                                                        ? null
                                                        : e.target.valueAsNumber
                                                )
                                            }
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Description */}
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='text-black font-semibold text-sm'>Description</FormLabel>
                                <FormControl>
                                    <RichEditor
                                        disabled
                                        value={field.value || ""}
                                        onChangeValue={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Submit */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            className="px-6 py-2 text-lg"
                            disabled={
                                isUpdating
                                    ? syncToEbayMutation.isPending
                                    : updateProductMutation.isPending
                            }
                        >
                            {isUpdating ? (
                                syncToEbayMutation.isPending ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    "Update"
                                )
                            ) : updateProductMutation.isPending ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                "Add"
                            )}
                        </Button>

                    </div>
                </form>
            </Form>
        </div>
    )
}

export default SyncToEbayForm
