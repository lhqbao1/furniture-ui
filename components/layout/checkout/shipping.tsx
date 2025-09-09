"use client"

import { useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Address } from "@/types/address"
import { useFormContext, useController } from "react-hook-form"
import {
    FormItem,
    FormLabel,
    FormMessage,
    FormControl,
} from "@/components/ui/form"

type AddressSelectorProps = {
    name: string
    addresses: Address[]
    label?: string
}

export default function AddressSelector({ name, addresses, label }: AddressSelectorProps) {
    const { control } = useFormContext()
    const { field } = useController({ name, control })

    // 🔑 Nếu chỉ có 1 address thì auto chọn
    useEffect(() => {
        if (addresses.length === 1 && !field.value) {
            field.onChange(addresses[0].id)
        }
    }, [addresses, field])

    return (
        <FormItem className="space-y-3">
            {label && <FormLabel>{label}</FormLabel>}
            <FormControl>
                <RadioGroup
                    value={field.value || ""}
                    onValueChange={(value) => field.onChange(value)}
                    className="grid grid-cols-2 gap-4"
                >
                    {addresses.map((address) => (
                        <Card
                            key={address.id}
                            className={`cursor-pointer transition border ${field.value === address.id
                                ? "border-secondary border-2"
                                : "border-muted"
                                }`}
                            onClick={() => field.onChange(address.id)} // click toàn card cũng chọn
                        >
                            <CardHeader className="flex items-center gap-2">
                                <RadioGroupItem
                                    value={address.id}
                                    id={address.id}
                                    className="mt-1"
                                />
                                <Label
                                    htmlFor={address.id}
                                    className="text-lg font-semibold cursor-pointer"
                                >
                                    {address.name_address}
                                </Label>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground space-y-1 pl-7">
                                <p>{address.address_line}</p>
                                <p>{address.city}</p>
                                <p>{address.country}</p>
                                {address.recipient_name && (
                                    <p>Recipient: {address.recipient_name}</p>
                                )}
                                {address.phone_number && <p>{address.phone_number}</p>}
                            </CardContent>
                        </Card>
                    ))}
                </RadioGroup>
            </FormControl>
            <FormMessage />
        </FormItem>
    )
}
