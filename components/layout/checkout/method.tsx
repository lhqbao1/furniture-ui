'use client'

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardHeader } from "@/components/ui/card"
import Image from "next/image"
import { paymentOptions } from "@/data/data"

type PaymentMethodSelectorProps = {
    field?: {
        value: string
        onChange: (value: string) => void
    }
}

export default function PaymentMethodSelector({ field }: PaymentMethodSelectorProps) {
    return (
        <div className="space-y-2">
            <RadioGroup
                // value={field.value}
                // onValueChange={field.onChange}
                className="flex gap-4">
                {paymentOptions.map((option) => (
                    <div key={option.id} className="flex gap-2 items-center">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label htmlFor={option.id} className="text-base font-medium">
                            <Image
                                src={option.logo}
                                width={30}
                                height={30}
                                alt=""
                                className="size-6"
                            />
                            <div>{option.label}</div>
                        </Label>
                    </div>
                ))}
            </RadioGroup>
        </div>
    )
}
