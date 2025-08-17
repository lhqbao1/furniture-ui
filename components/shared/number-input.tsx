import { ChevronDown, ChevronUp } from "lucide-react"
import { forwardRef, useEffect, useState } from "react"
import { NumericFormat, NumericFormatProps } from "react-number-format"
import { Input } from "../ui/input"
import { Button } from "../ui/button"


export interface NumberInputProps
    extends Omit<NumericFormatProps, "value" | "onValueChange"> {
    stepper?: number
    thousandSeparator?: string
    placeholder?: string
    defaultValue?: number
    min?: number
    max?: number
    value?: number
    suffix?: string
    prefix?: string
    onValueChange?: (value: number | undefined) => void
    fixedDecimalScale?: boolean
    decimalScale?: number
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
    (
        {
            stepper = 1,
            thousandSeparator,
            placeholder,
            defaultValue,
            min = -Infinity,
            max = Infinity,
            onValueChange,
            fixedDecimalScale = false,
            decimalScale = 0,
            suffix,
            prefix,
            value: controlledValue,
            ...props
        },
        ref
    ) => {
        const [value, setValue] = useState<number | undefined>(
            controlledValue ?? defaultValue
        )

        const updateValue = (newValue: number | undefined) => {
            if (newValue === undefined) return
            const clamped = Math.min(Math.max(newValue, min), max)
            setValue(clamped)
            onValueChange?.(clamped)
        }

        const handleIncrement = () => updateValue((value ?? 0) + stepper)
        const handleDecrement = () => updateValue((value ?? 0) - stepper)

        useEffect(() => {
            if (controlledValue !== undefined) setValue(controlledValue)
        }, [controlledValue])

        useEffect(() => {
            const el = (ref as React.RefObject<HTMLInputElement>)?.current
            const handleKeyDown = (e: KeyboardEvent) => {
                if (document.activeElement !== el) return
                e.key === "ArrowUp" && handleIncrement()
                e.key === "ArrowDown" && handleDecrement()
            }
            window.addEventListener("keydown", handleKeyDown)
            return () => window.removeEventListener("keydown", handleKeyDown)
        }, [ref, handleIncrement, handleDecrement])

        return (
            <div className="flex items-center">
                <NumericFormat
                    value={value}
                    onValueChange={({ floatValue }) => updateValue(floatValue)}
                    thousandSeparator={thousandSeparator}
                    decimalScale={decimalScale}
                    fixedDecimalScale={fixedDecimalScale}
                    allowNegative={min < 0}
                    valueIsNumericString
                    onBlur={() => updateValue(value)}
                    max={max}
                    min={min}
                    suffix={suffix}
                    prefix={prefix}
                    customInput={Input}
                    placeholder={placeholder}
                    className="[appearance:textfield] h-10 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-r-none relative"
                    getInputRef={ref}
                    {...props}
                />

                <div className="flex flex-col">
                    <Button
                        aria-label="Increase value"
                        className="px-2 h-5 rounded-l-none rounded-br-none border-input border-l-0 border-b-[0.5px] focus-visible:relative"
                        variant="outline"
                        onClick={handleIncrement}
                        disabled={value === max}
                    >
                        <ChevronUp size={15} />
                    </Button>
                    <Button
                        aria-label="Decrease value"
                        className="px-2 h-5 rounded-l-none rounded-tr-none border-input border-l-0 border-t-[0.5px] focus-visible:relative"
                        variant="outline"
                        onClick={handleDecrement}
                        disabled={value === min}
                    >
                        <ChevronDown size={15} />
                    </Button>
                </div>
            </div>
        )
    }
)

NumberInput.displayName = "NumberInput"
