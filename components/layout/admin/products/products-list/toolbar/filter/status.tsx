"use client"

import { Label } from "@/components/ui/label"
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui/radio-group"

interface ProductStatusFilterProps {
    showAll: boolean
    setShowAll: (value: boolean) => void
}

export default function ProductStatusFilter({ showAll, setShowAll }: ProductStatusFilterProps) {
    // Map showAll -> radio value
    const value =
        showAll === true ? "inactive"
            : "active"

    // Khi user chọn radio, cập nhật lại showAll tương ứng
    const handleChange = (v: string) => {
        if (v === "active") setShowAll(false)
        else if (v === "inactive") setShowAll(true)
    }

    return (
        <div className="flex flex-col gap-3">
            <Label className="font-medium">Product Active</Label>
            <RadioGroup
                value={value}
                onValueChange={handleChange}
                className="flex items-center gap-6"
            >
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="active" id="active" />
                    <Label htmlFor="active" className="cursor-pointer">
                        Active
                    </Label>
                </div>

                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="inactive" id="inactive" />
                    <Label htmlFor="inactive" className="cursor-pointer">
                        All
                    </Label>
                </div>
            </RadioGroup>
        </div>
    )
}
