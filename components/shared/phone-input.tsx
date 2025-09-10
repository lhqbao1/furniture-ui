"use client"

import React from "react"
import PhoneInput, { PhoneInputProps } from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"
import { cn } from "@/lib/utils"

type Props = PhoneInputProps & {
    inputClassName?: string
}

export const PhoneInputShadcn = React.forwardRef<HTMLInputElement, Props>(
    ({ inputClassName, ...props }, ref) => {
        return (
            <PhoneInput
                {...props}
                inputProps={{
                    ref,
                }}
                containerClass="w-full"
                inputClass={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    inputClassName
                )}
                buttonClass="border-none bg-transparent"
            />
        )
    }
)

PhoneInputShadcn.displayName = "PhoneInputShadcn"
