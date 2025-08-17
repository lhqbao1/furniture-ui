"use client"

import * as React from "react"
import { Slider } from "@/components/ui/slider"

interface RangePickerProps {
    minValue: number;
    maxValue: number;
    step: number;
}

export default function RangePicker({ minValue, maxValue, step }: RangePickerProps) {
    const [range, setRange] = React.useState([minValue, maxValue])

    return (
        <div className="w-full flex flex-col gap-3 relative">
            <div className="flex flex-row justify-between">
                <div className="text-gray-500 font-semibold">€{range[0]}</div>
                <div className="text-gray-500 font-semibold">€{range[1]}</div>
            </div>
            <Slider
                value={range}
                onValueChange={setRange}
                min={minValue}
                max={maxValue}
                step={step}
                className="w-full"
            />
            <div className="flex flex-row justify-between">
                <div className="border border-gray-400 px-4 rounded-sm text-gray-400">min</div>
                <div className="border border-gray-400 px-4 rounded-sm text-gray-400">Max</div>
            </div>
        </div>
    )
}
