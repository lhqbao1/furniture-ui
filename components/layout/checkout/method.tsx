'use client'

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useFormContext, Controller } from "react-hook-form"
import Image from "next/image"
import { paymentOptions } from "@/data/data"
import { FormField, FormItem, FormMessage } from "@/components/ui/form"

export default function PaymentMethodSelector() {
    const { control } = useFormContext()

    return (
        <FormField
            control={control}
            name="payment_method"
            render={({ field }) => (
                <FormItem>
                    <RadioGroup
                        className="lg:flex lg:gap-4 grid grid-cols-2 gap-y-4 mt-4 lg:mt-0"
                        value={field.value}
                        onValueChange={field.onChange}
                    >
                        {paymentOptions.map((option) => (
                            <div key={option.id} className="flex gap-2 items-center">
                                <RadioGroupItem value={option.id} id={option.id} />
                                <Label htmlFor={option.id} className="text-base font-medium flex items-center gap-2">
                                    <Image
                                        src={option.logo}
                                        width={30}
                                        height={30}
                                        alt=""
                                        className="size-6"
                                    />
                                    <span>{option.label}</span>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
