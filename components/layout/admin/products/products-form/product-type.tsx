"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface ProductTypeSelectorProps {
    isSimple: boolean
    setIsSimple: (value: boolean) => void
}

export default function ProductTypeSelector({
    isSimple,
    setIsSimple,
}: ProductTypeSelectorProps) {
    return (
        <div className="flex flex-col gap-4">
            <RadioGroup
                value={String(isSimple)} // "true" | "false"
                onValueChange={(val) => setIsSimple(val === "true")}
                className="flex gap-6"
            >
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="simple" />
                    <Label htmlFor="simple">Simple Product</Label>
                </div>

                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="variant" />
                    <Label htmlFor="variant">Variant Product</Label>
                </div>
            </RadioGroup>
        </div>
    )
}
