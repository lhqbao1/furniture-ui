"use client"

import { UseFormReturn } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ProductItem } from "@/types/products"
import { useEffect, useState } from "react"

interface ProductPricingFieldsProps {
    form: UseFormReturn<ProductItem>
}

export function ProductPricingFields({ form }: ProductPricingFieldsProps) {
    const price = form.watch("price") || 0
    const discountPercent = form.watch("discount_percent") || 0
    const discountAmount = form.watch("discount_amount") || 0

    const [activeField, setActiveField] = useState<"percent" | "amount" | null>("percent")

    // Tính toán dựa theo activeField
    useEffect(() => {
        if (activeField === "percent") {
            const amount = (price * discountPercent) / 100
            const final = Math.max(price - amount, 0)
            form.setValue("discount_amount", amount)
            form.setValue("final_price", final)
        } else if (activeField === "amount") {
            const percent = price > 0 ? (discountAmount / price) * 100 : 0
            const final = Math.max(price - discountAmount, 0)
            form.setValue("discount_percent", percent)
            form.setValue("final_price", final)
        }
    }, [price, discountPercent, discountAmount, activeField, form])

    return (
        <div className="grid grid-cols-12 gap-6">
            {/* Price */}
            <div className="col-span-3">
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[#666666] text-sm">Price</FormLabel>
                            <FormControl>
                                <div className="relative flex items-center">
                                    <Input
                                        {...field}
                                        type="number"
                                        min={0}
                                        className="pl-7"
                                        onChange={(e) => {
                                            field.onChange(e.target.valueAsNumber)
                                        }}
                                    />
                                    <span className="absolute left-3 text-gray-500">€</span>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Discount Percent */}
            <div className="col-span-3">
                <FormField
                    control={form.control}
                    name="discount_percent"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[#666666] text-sm">Discount %</FormLabel>
                            <FormControl>
                                <div className="relative flex items-center">
                                    <Input
                                        {...field}
                                        type="number"
                                        min={0}
                                        max={100}
                                        className="pl-7"
                                        onFocus={() => setActiveField("percent")}
                                        onChange={(e) => {
                                            let val = e.target.valueAsNumber
                                            if (isNaN(val)) val = 0
                                            if (val > 100) val = 100
                                            if (val < 0) val = 0
                                            field.onChange(val)
                                        }}
                                        readOnly={activeField === "amount"} // readonly khi user nhập amount
                                    />
                                    <span className="absolute left-3 text-gray-500">%</span>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Discount Amount */}
            <div className="col-span-3">
                <FormField
                    control={form.control}
                    name="discount_amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[#666666] text-sm">Discount Amount</FormLabel>
                            <FormControl>
                                <div className="relative flex items-center">
                                    <Input
                                        {...field}
                                        type="number"
                                        min={0}
                                        className="pl-7"
                                        onFocus={() => setActiveField("amount")}
                                        onChange={(e) => {
                                            let val = e.target.valueAsNumber
                                            if (isNaN(val)) val = 0

                                            const price = form.getValues("price") || 0
                                            if (val > price) val = price
                                            if (val < 0) val = 0

                                            field.onChange(val)
                                        }}
                                        readOnly={activeField === "percent"} // readonly khi user nhập percent
                                    />

                                    <span className="absolute left-3 text-gray-500">€</span>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Final Price */}
            <div className="col-span-3">
                <FormField
                    control={form.control}
                    name="final_price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[#666666] text-sm">Final Price</FormLabel>
                            <FormControl>
                                <div className="relative flex items-center">
                                    <Input
                                        {...field}
                                        readOnly
                                        type="number"
                                        min={0}
                                        className="pl-7 bg-gray-100 cursor-not-allowed"
                                    />
                                    <span className="absolute left-3 text-gray-500">€</span>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    )
}
