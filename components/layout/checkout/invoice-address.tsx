"use client"
import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useState } from "react"
import "react-phone-input-2/lib/style.css"
import { useTranslations } from "next-intl"
import { City, State } from 'country-state-city'
import { useCheckMailExist } from "@/features/auth/hook"

const CheckOutInvoiceAddress = () => {
    const form = useFormContext()
    const t = useTranslations()
    const [open, setOpen] = useState(false)
    const checkMailExistMutation = useCheckMailExist();


    // Lấy tất cả bang của Đức
    const states = State.getStatesOfCountry('DE')

    // Lấy tất cả thành phố từ tất cả bang
    const allCities = states.flatMap(state => City.getCitiesOfState('DE', state.isoCode))

    // Lấy danh sách tên thành phố
    const cityNames = allCities.map(city => city.name)

    const cityOptions = cityNames.map((c) => ({
        value: c,
        label: c,
    }))

    return (
        <div className="space-y-4">
            <h2 className="text-lg text-black font-semibold bg-secondary/10 p-2">{t('invoiceAddress')}</h2>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('firstName')}</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter first name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('lastName')}</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter last name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="invoice_address_line"
                    render={({ field }) => (
                        <FormItem className="col-span-2">
                            <FormLabel>{t('streetAndHouse')}</FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="invoice_postal_code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('postalCode')}</FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="invoice_city"
                    render={({ field }) => {

                        return (
                            <FormItem>
                                <FormLabel className="text-[#666666] text-sm">{t('city')}</FormLabel>
                                <FormControl>
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                    "w-full justify-between",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value || t('selectCity')}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="" />
                                                <CommandEmpty>{t('noCity')}</CommandEmpty>
                                                <CommandList className="h-[400px]">
                                                    <CommandGroup>
                                                        {cityOptions.map((c, index) => (
                                                            <CommandItem
                                                                key={index}
                                                                value={c.value}
                                                                onSelect={() => {
                                                                    field.onChange(c.value)
                                                                    setOpen(false) // ✅ đóng popover sau khi chọn
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
                                    </Popover>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )
                    }}
                />


                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('email')}</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder=""
                                    {...field}
                                    onBlur={() => {
                                        if (field.value) {
                                            checkMailExistMutation.mutate(field.value)
                                        }
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('phone_number')}</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="+49"
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

export default CheckOutInvoiceAddress
