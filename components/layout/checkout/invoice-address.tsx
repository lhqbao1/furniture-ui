"use client"
import { useFormContext, useWatch } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useEffect, useRef, useState } from "react"
import "react-phone-input-2/lib/style.css"
import { useTranslations } from "next-intl"
import { City, State } from "country-state-city"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface InvoiceAddressValues {
    invoice_address_line: string
    invoice_address_additional?: string
    invoice_postal_code: string
    invoice_city: string
}

interface CheckOutInvoiceAddressProps {
    isAdmin?: boolean
}

const CheckOutInvoiceAddress = ({ isAdmin = false }: CheckOutInvoiceAddressProps) => {
    const form = useFormContext()
    const t = useTranslations()
    const [open, setOpen] = useState(false)
    const [isSameShipping, setIsSameShipping] = useState(true)

    // Watch shipping fields
    const shippingAddressLine = useWatch({ name: "shipping_address_line", control: form.control })
    const shippingPostalCode = useWatch({ name: "shipping_postal_code", control: form.control })
    const shippingCity = useWatch({ name: "shipping_city", control: form.control })
    const shippingAddressAdditional = useWatch({ name: "shipping_address_additional", control: form.control })

    // Dùng ref lưu snapshot invoice gốc
    const invoiceSnapshot = useRef<InvoiceAddressValues | null>(null)

    useEffect(() => {
        if (isSameShipping) {
            // Lưu lại dữ liệu invoice hiện tại
            invoiceSnapshot.current = {
                invoice_address_line: form.getValues("invoice_address_line"),
                invoice_address_additional: form.getValues("invoice_address_additional"),
                invoice_postal_code: form.getValues("invoice_postal_code"),
                invoice_city: form.getValues("invoice_city"),
            }

            // Copy shipping → invoice
            form.setValue("invoice_address_line", shippingAddressLine)
            form.setValue("invoice_address_additional", shippingAddressAdditional)
            form.setValue("invoice_postal_code", shippingPostalCode)
            form.setValue("invoice_city", shippingCity)
        } else {
            // Restore lại snapshot nếu có
            if (invoiceSnapshot.current) {
                form.setValue("invoice_address_line", invoiceSnapshot.current.invoice_address_line)
                form.setValue("invoice_address_additional", invoiceSnapshot.current.invoice_address_additional ?? "")
                form.setValue("invoice_postal_code", invoiceSnapshot.current.invoice_postal_code)
                form.setValue("invoice_city", invoiceSnapshot.current.invoice_city)
            }
        }
    }, [
        isSameShipping,
        shippingAddressLine,
        shippingAddressAdditional,
        shippingPostalCode,
        shippingCity,
        form,
    ])

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
            <div className="flex justify-between lg:flex-row flex-col bg-secondary/10 p-2">
                <h2 className="text-lg text-black font-semibold">{isAdmin ? "Invoice Address" : t("invoiceAddress")}</h2>
                <div className="flex items-center space-x-2">
                    <Label htmlFor="same-invoice">{isAdmin ? "Same as Shipping" : t("sameAsShipping")}</Label>
                    <Switch
                        id="same-invoice"
                        checked={isSameShipping}
                        onCheckedChange={setIsSameShipping}
                        className="data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-secondary"
                    />
                </div>
            </div>
            {isSameShipping === true ? '' :
                (
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="invoice_address_line"
                            render={({ field }) => (
                                <FormItem className="col-span-2">
                                    <FormLabel>{isAdmin ? "Address line" : t("streetAndHouse")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} disabled={isSameShipping} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="invoice_address_additional"
                            render={({ field }) => (
                                <FormItem className="col-span-2">
                                    <FormLabel>{isAdmin ? "Additional Address" : t("addressSupplement")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} disabled={isSameShipping} />
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
                                    <FormLabel>{isAdmin ? "Postal Code" : t("postalCode")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} disabled={isSameShipping} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="invoice_city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#666666] text-sm">{isAdmin ? "City" : t("city")}</FormLabel>
                                    <FormControl>
                                        <Popover open={open} onOpenChange={setOpen}>
                                            <PopoverTrigger asChild disabled={isSameShipping}>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                                >
                                                    {field.value || (isAdmin ? "Select City" : t('selectCity'))}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                                <Command>
                                                    <CommandInput placeholder="" />
                                                    <CommandEmpty>{t("noCity")}</CommandEmpty>
                                                    <CommandList className="h-[400px]">
                                                        <CommandGroup>
                                                            {cityOptions.map((c, index) => (
                                                                <CommandItem
                                                                    key={index}
                                                                    value={c.value}
                                                                    onSelect={() => {
                                                                        field.onChange(c.value)
                                                                        setOpen(false) // đóng popover sau khi chọn
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
                            )}
                        />
                    </div>
                )
            }

        </div>
    )
}

export default CheckOutInvoiceAddress
