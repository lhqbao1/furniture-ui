// components/ui/form-label.tsx (nếu bạn custom shadcn)
import * as React from "react"
import { Label } from "@/components/ui/label"

interface FormLabelProps extends React.ComponentProps<typeof Label> {
    required?: boolean
}

export function FormLabelWithAsterisk({ children, required, ...props }: FormLabelProps) {
    return (
        <Label {...props} className="w-full col-span-2">
            <div className="relative">
                <span className="text-[#666666]">{children}</span>
                {required && <span className="text-red-500 absolute top-0 -right-2">*</span>}
            </div>
        </Label>
    )
}
