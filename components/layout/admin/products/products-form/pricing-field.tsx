"use client"

import { useFormContext, UseFormReturn } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"

export function ProductPricingFields() {
    const form = useFormContext()

    const [activeField, setActiveField] = useState<"percent" | "amount" | "final" | null>("percent")

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
                                        step="0.01"
                                        value={field.value ?? ""}
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
                                        min={0}
                                        className="pl-7"
                                        step="0.01"
                                        value={field.value ?? ""}
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
                                        min={0}
                                        className="pl-7"
                                        step="0.01"
                                        value={field.value ?? ""}
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
        </div>
    )
}
