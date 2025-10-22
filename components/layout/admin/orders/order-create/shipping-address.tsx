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
import { useTranslations } from "next-intl"
import { useState, useEffect } from "react"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandInput } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import { City, State } from "country-state-city"

interface CheckOutShippingAddressProps {
    isAdmin?: boolean
}

export default function ManualCheckOutShippingAddress({ isAdmin = false }: CheckOutShippingAddressProps) {
    const form = useFormContext()
    const t = useTranslations()
    const [open, setOpen] = useState(false)
    const [isSameInvoice, setIsSameInvoice] = useState(false)
    const [countries, setCountries] = useState<{ value: string; label: string }[]>([])

    useEffect(() => {
        import("world-countries").then((module) => {
            setCountries(
                module.default.map((c) => ({ value: c.name.common, label: c.name.common }))
            )
        })
    }, [])

    // Lấy tất cả bang của Đức
    const states = State.getStatesOfCountry("DE")
    // Lấy tất cả thành phố từ tất cả bang
    const allCities = states.flatMap((state) => City.getCitiesOfState("DE", state.isoCode))
    // Danh sách tên thành phố
    const cityOptions = allCities.map((city) => ({
        value: city.name,
        label: city.name,
    }))

    return (
        <div className="space-y-4">
            <div className="flex justify-between bg-secondary/10 p-2">
                <h2 className="text-lg text-black font-semibold ">Shipping Address</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {/* Address Line */}
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem className="col-span-2">
                            <FormLabel className="text-[#666666] text-sm">
                                Address Line
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder=""
                                    {...field}
                                    disabled={isSameInvoice}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Postal Code */}
                <FormField
                    control={form.control}
                    name="postal_code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[#666666] text-sm">
                                Postal Code
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder=""
                                    {...field}
                                    disabled={isSameInvoice}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* City */}
                <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[#666666] text-sm">City</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder=""
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    )
}
