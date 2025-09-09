"use client"

import { UseFormReturn } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { ProductInput } from "@/lib/schema/product"

interface ProductPricingFieldsProps {
    form: UseFormReturn<ProductInput>
}

export function ProductPricingFields({ form }: ProductPricingFieldsProps) {
    const price = form.watch("price") || 0
    const discountPercent = form.watch("discount_percent") || 0
    const discountAmount = form.watch("discount_amount") || 0
    const finalPrice = form.watch("final_price") || 0

    const [activeField, setActiveField] = useState<"percent" | "amount" | "final" | null>("percent")

    useEffect(() => {
        if (!price) {
            form.setValue("discount_percent", 0)
            form.setValue("discount_amount", 0)
            form.setValue("final_price", 0)
            return
        }

        if (activeField === "percent") {
            const amount = (price * discountPercent) / 100
            const final = Math.max(price - amount, 0)
            form.setValue("discount_amount", parseFloat(amount.toFixed(2)))
            form.setValue("final_price", parseFloat(final.toFixed(2)))
        } else if (activeField === "amount") {
            const percent = price > 0 ? (discountAmount / price) * 100 : 0
            const final = Math.max(price - discountAmount, 0)
            form.setValue("discount_percent", parseFloat(percent.toFixed(2)))
            form.setValue("final_price", parseFloat(final.toFixed(2)))
        } else if (activeField === "final") {
            const amount = Math.max(price - finalPrice, 0)
            const percent = price > 0 ? (amount / price) * 100 : 0
            form.setValue("discount_amount", parseFloat(amount.toFixed(2)))
            form.setValue("discount_percent", parseFloat(percent.toFixed(2)))
        }
    }, [price, discountPercent, discountAmount, finalPrice, activeField, form])

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
                                        step="0.01"
                                        inputMode="decimal"
                                        value={field.value ?? ""}
                                        onFocus={() => setActiveField(null)}
                                        onChange={(e) => {
                                            const val = e.target.valueAsNumber
                                            const parsed = isNaN(val) ? 0 : val
                                            field.onChange(parsed)
                                            form.setValue("price", parsed, { shouldValidate: true })
                                        }}
                                        onBlur={(e) => {
                                            const val = parseFloat(e.target.value)
                                            if (!isNaN(val)) {
                                                form.setValue("price", parseFloat(val.toFixed(2)))
                                            }
                                        }}
                                        className="pl-7"
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
                                        step="0.01"
                                        inputMode="decimal"
                                        value={field.value ?? ""}
                                        onFocus={() => setActiveField("percent")}
                                        onChange={(e) => {
                                            let val = e.target.valueAsNumber
                                            if (isNaN(val)) val = 0
                                            if (val > 100) val = 100
                                            if (val < 0) val = 0
                                            field.onChange(val)
                                            form.setValue("discount_percent", val, { shouldValidate: true })
                                        }}
                                        onBlur={(e) => {
                                            const val = parseFloat(e.target.value)
                                            if (!isNaN(val)) {
                                                form.setValue("discount_percent", parseFloat(val.toFixed(2)))
                                            }
                                        }}
                                        readOnly={activeField === "amount" || activeField === "final"}
                                        className="pl-7"
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
                                        step="0.01"
                                        inputMode="decimal"
                                        value={field.value ?? ""}
                                        onFocus={() => setActiveField("amount")}
                                        onChange={(e) => {
                                            let val = e.target.valueAsNumber
                                            if (isNaN(val)) val = 0
                                            const p = form.getValues("price") || 0
                                            if (val > p) val = p
                                            if (val < 0) val = 0
                                            field.onChange(val)
                                            form.setValue("discount_amount", val, { shouldValidate: true })
                                        }}
                                        onBlur={(e) => {
                                            const val = parseFloat(e.target.value)
                                            if (!isNaN(val)) {
                                                form.setValue("discount_amount", parseFloat(val.toFixed(2)))
                                            }
                                        }}
                                        readOnly={activeField === "percent" || activeField === "final"}
                                        className="pl-7"
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
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        inputMode="decimal"
                                        value={field.value ?? ""}
                                        onFocus={() => setActiveField("final")}
                                        onChange={(e) => {
                                            let val = e.target.valueAsNumber
                                            if (isNaN(val)) val = 0
                                            const p = form.getValues("price") || 0
                                            if (val > p) val = p
                                            if (val < 0) val = 0
                                            field.onChange(val)
                                            form.setValue("final_price", val, { shouldValidate: true })
                                        }}
                                        onBlur={(e) => {
                                            const val = parseFloat(e.target.value)
                                            if (!isNaN(val)) {
                                                form.setValue("final_price", parseFloat(val.toFixed(2)))
                                            }
                                        }}
                                        className="pl-7"
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
