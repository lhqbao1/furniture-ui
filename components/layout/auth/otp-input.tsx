import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import React, { useRef } from "react"

export function OtpInput({
    value,
    onChange,
}: {
    value: string
    onChange: (val: string) => void
}) {
    const inputs = useRef<(HTMLInputElement | null)[]>([])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const val = e.target.value
        if (/^[0-9]$/.test(val)) {
            const newValue = value.split("")
            newValue[index] = val
            onChange(newValue.join(""))
            if (index < inputs.current.length - 1) {
                inputs.current[index + 1]?.focus()
            }
        } else {
            e.target.value = ""
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            const newValue = value.split("")
            newValue[index] = ""
            onChange(newValue.join(""))

            if (!e.currentTarget.value && index > 0) {
                inputs.current[index - 1]?.focus()
            }
        }
    }

    return (
        <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
                <Input
                    key={i}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[i] ?? ""}
                    className={cn(
                        "text-center text-xl aspect-square h-12 text-black",
                        value[i] ? "bg-gray-200" : "bg-white"
                    )} onChange={(e) => handleChange(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    ref={(el) => { inputs.current[i] = el; }}
                />
            ))}
        </div>
    )
}
