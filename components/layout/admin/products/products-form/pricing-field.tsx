"use client"

import { useFormContext, UseFormReturn } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { ProductInput } from "@/lib/schema/product"
import { FormLabelWithAsterisk } from "@/components/shared/form-label-with-asterisk"

// interface ProductPricingFieldsProps {
//     form: UseFormReturn<ProductInput>
// }

export function ProductPricingFields() {
    const form = useFormContext()
    const price = form.watch("price") || 0
    const discountPercent = form.watch("discount_percent") || 0
    const discountAmount = form.watch("discount_amount") || 0
    const finalPrice = form.watch("final_price") || 0

    const [activeField, setActiveField] = useState<"percent" | "amount" | "final" | null>("percent")

    useEffect(() => {
        if (!price) {
            form.setValue("discount_percent", 0)
            form.setValue("discount_amount", 0)
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
    }, [price, discountPercent, discountAmount, finalPrice, activeField])

    return (
        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
                <FormField
                    control={form.control}
                    name="cost"
                    render={({ field }) => (
                        <FormItem className='flex flex-col'>
                            <FormLabel className='text-[#666666] text-sm'>
                                Cost
                            </FormLabel>
                            <FormControl>
                                <div className="relative flex items-center w-full">
                                    <Input
                                        {...field}
                                        type="number"
                                        min={0}
                                        className="pl-7"
                                        step="0.01"            // hoặc "any" để cho phép mọi số thập phân
                                        inputMode="decimal"    // hint cho bàn phím mobile
                                        value={field.value ?? ""} // tránh uncontrolled / NaN
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.value === "" ? null : e.target.valueAsNumber
                                            )
                                        }
                                    />
                                    <span className="absolute left-3 text-gray-500">€</span>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="col-span-3">
                <FormField
                    control={form.control}
                    name="delivery_cost"
                    render={({ field }) => (
                        <FormItem className='flex flex-col'>
                            <FormLabel className='text-[#666666] text-sm'>
                                Delivery cost
                            </FormLabel>
                            <FormControl>
                                <div className="relative flex items-center w-full">
                                    <Input
                                        {...field}
                                        type="number"
                                        // min={0}
                                        className="pl-7"
                                        step="0.01"            // hoặc "any" để cho phép mọi số thập phân
                                        inputMode="decimal"    // hint cho bàn phím mobile
                                        value={field.value ?? ""} // tránh uncontrolled / NaN
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.value === "" ? null : e.target.valueAsNumber
                                            )
                                        }
                                    />
                                    <span className="absolute left-3 text-gray-500">€</span>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            {/* Price */}
            <div className="col-span-3">
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem className='flex flex-col'>
                            <FormLabel className="text-[#666666] text-sm">Original Price</FormLabel>
                            <FormControl>
                                <div className="relative flex items-center">
                                    <Input
                                        {...field}
                                        type="number"
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

            {/* Final Price */}
            <div className="col-span-3">
                <FormField
                    control={form.control}
                    name="final_price"
                    render={({ field }) => (
                        <FormItem className='flex flex-col'>
                            <FormLabel className="text-[#666666] text-sm">Sale Price</FormLabel>
                            <FormControl>
                                <div className="relative flex items-center">
                                    <Input
                                        {...field}
                                        type="number"
                                        step="0.01"
                                        inputMode="decimal"
                                        value={field.value ?? ""}
                                        onFocus={() => setActiveField("final")}
                                        onChange={(e) => {
                                            let val = e.target.valueAsNumber
                                            if (isNaN(val)) val = 0
                                            const p = form.getValues("price") || 0
                                            // if (val > p) val = p
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
