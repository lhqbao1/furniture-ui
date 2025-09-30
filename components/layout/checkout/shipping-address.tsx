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
import countries from "world-countries"
import { Check, ChevronsUpDown } from "lucide-react"

export default function CheckOutShippingAddress() {
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

    const countryOptions = countries.map((c) => ({
        value: c.value,
        label: c.label,
    }))

    return (
        <div className="space-y-4">
            <div className="flex justify-between bg-secondary/10 p-2">
                <h2 className="text-lg text-black font-semibold ">{t('shippingAddress')}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {/* Address Line */}
                <FormField
                    control={form.control}
                    name="shipping_address_line"
                    render={({ field }) => (
                        <FormItem className="col-span-2">
                            <FormLabel className="text-[#666666] text-sm">
                                {t('streetAndHouse')}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter your shipping address"
                                    {...field}
                                    disabled={isSameInvoice}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="shipping_address_additional"
                    render={({ field }) => (
                        <FormItem className="col-span-2">
                            <FormLabel>{t('addressSupplement')}</FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Postal Code */}
                <FormField
                    control={form.control}
                    name="shipping_postal_code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[#666666] text-sm">
                                {t('postalCode')}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Postal Code"
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
                    name="shipping_city"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[#666666] text-sm">{t('city')}</FormLabel>
                            <FormControl>
                                <Popover open={open && !isSameInvoice} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn(
                                                "w-full justify-between",
                                                !field.value && "text-muted-foreground"
                                            )}
                                            disabled={isSameInvoice}
                                        >
                                            {field.value || t('selectCity')}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    {!isSameInvoice && (
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="" />
                                                <CommandEmpty>{t('noCity')}</CommandEmpty>
                                                <CommandList className="h-[400px]">
                                                    <CommandGroup>
                                                        {countryOptions.map((c) => (
                                                            <CommandItem
                                                                key={c.value}
                                                                value={c.value}
                                                                onSelect={() => {
                                                                    field.onChange(c.value)
                                                                    setOpen(false)
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        field.value === c.value ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {c.label}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    )}
                                </Popover>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    )
}
