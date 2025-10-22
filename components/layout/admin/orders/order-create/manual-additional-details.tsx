"use client"

import { useFormContext, Controller, useWatch } from "react-hook-form"
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ManualAdditionalInformationProps {
    isAdmin?: boolean
}

export default function ManualAdditionalInformation({ isAdmin = false }: ManualAdditionalInformationProps) {
    const form = useFormContext()

    return (
        <div className="space-y-4">
            <div className="flex justify-between bg-secondary/10 p-2">
                <h2 className="text-lg text-black font-semibold ">Additional Information</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {/* Address Line */}
                <FormField
                    control={form.control}
                    name="from_marketplace"
                    render={({ field }) => (
                        <FormItem className="col-span-2">
                            <FormLabel className="text-[#666666] text-sm">Marketplace</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger placeholderColor className="border">
                                        <SelectValue placeholder="Select marketplace" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="amazon">Amazon</SelectItem>
                                        <SelectItem value="kaufland">Kaufland</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="marketplace_order_id"
                    render={({ field }) => (
                        <FormItem className="col-span-2">
                            <FormLabel className="text-[#666666] text-sm">
                                Marketplace Order ID
                            </FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder=""
                                    onChange={(e) => {
                                        const value = e.target.value.trim()
                                        field.onChange(value === "" ? null : value)
                                    }}
                                    value={field.value ?? ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />



                <FormField
                    control={form.control}
                    name="carrier"
                    render={({ field }) => (
                        <FormItem className="col-span-2">
                            <FormLabel className="text-[#666666] text-sm">Carrier</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger placeholderColor className="border">
                                        <SelectValue placeholder="Select carrier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="dpd">DPD</SelectItem>
                                        <SelectItem value="spedition">Spedition</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />


            </div>
        </div>
    )
}
