"use client"

import * as React from "react"
import { Switch } from "@/components/ui/switch"

export default function CustomSwitch() {
    // false = Newest, true = Oldest
    const [isOldest, setIsOldest] = React.useState(false)

    return (
        <div className="flex flex-row items-center gap-4">
            {/* Newest */}
            <p
                className={`text-base font-semibold ${!isOldest ? "text-primary" : "text-gray-600"
                    }`}
            >
                Newest
            </p>

            <Switch checked={isOldest} onCheckedChange={setIsOldest} />

            {/* Oldest */}
            <p
                className={`text-base font-semibold ${isOldest ? "text-primary" : "text-gray-600"
                    }`}
            >
                Oldest
            </p>
        </div>
    )
}
