"use client"

import React, { useEffect } from "react"
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
import { ProductItem } from "@/types/products"
import { useEditProduct } from "@/features/products/hook"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface SyncToEbayFormProps {
    product: ProductItem
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

type MarketPlaceFormValues = z.infer<typeof marketPlaceSchema>

const SyncToEbayForm = ({ product, open, setOpen }: SyncToEbayFormProps) => {
    const updateProductMutation = useEditProduct()

    // Danh sách marketplace khả dụng
    const ALL_MARKETPLACES = ["ebay", "amazon", "kaufland"]

    // Lấy danh sách marketplace đã có
    const existingMarketplaces =
        product.marketplace_products?.map((m) => m.marketplace) ?? []

    // Lọc các marketplace chưa có
    const availableMarketplaces = ALL_MARKETPLACES.filter(
        (m) => !existingMarketplaces.includes(m)
    )



    const form = useForm<MarketPlaceFormValues>({
        resolver: zodResolver(marketPlaceSchema),
        defaultValues: {
            marketplace: "",
            name: product.name,
            description: product.description,
            final_price: product.final_price,
            min_stock: undefined,
            max_stock: undefined,
            sku: product.sku,
        },
    })

    const marketplace = form.watch("marketplace")

    useEffect(() => {
        if (marketplace === "ebay") {
            form.setValue("min_stock", 0)
            form.setValue("max_stock", 10)
        } else {
            form.setValue("min_stock", null)
            form.setValue("max_stock", null)
        }

    }, [marketplace, form])

    const onSubmit = (values: MarketPlaceFormValues) => {
        const updatedMarketplaceProducts = [
            ...(product.marketplace_products || []),
            values,
        ]

        updateProductMutation.mutate(
            {
                input: {
                    ...product,
                    category_ids: product.categories.map((c) => c.id),
                    marketplace_products: updatedMarketplaceProducts,
                },
                id: product.id,
            },
            {
                onSuccess() {
                    toast.success("Create product marketplace data successful")
                    setOpen(false)
                },
                onError() {
                    toast.error("Create product marketplace data fail")
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
                    <FormField
                        control={form.control}
                        name="marketplace"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Marketplace</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value || ""}
                                >
                                    <FormControl>
                                        <SelectTrigger className="border">
                                            <SelectValue placeholder="Select a marketplace" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {availableMarketplaces.length > 0 ? (
                                            availableMarketplaces.map((m) => (
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
                        )}
                    />

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

                    {/* Description */}
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Enter product description"
                                        {...field}
                                        className="min-h-[100px]"
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

                    {/* SKU */}
                    <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>SKU</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter SKU" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Submit */}
                    <div className="flex justify-end">
                        <Button type="submit" className="px-6 py-2 text-lg" disabled={updateProductMutation.isPending}>
                            {updateProductMutation.isPending ? <Loader2 className="animate-spin" /> : "Add"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default SyncToEbayForm
