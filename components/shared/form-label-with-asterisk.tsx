// components/ui/form-label.tsx (nếu bạn custom shadcn)
import * as React from "react"
import { Label } from "@/components/ui/label"

interface FormLabelProps extends React.ComponentProps<typeof Label> {
    required?: boolean
}

export function FormLabelWithAsterisk({ children, required, ...props }: FormLabelProps) {
    return (
        <Label {...props}>
            {children}
            {required && <span className="text-red-500">*</span>}
        </Label>
    )
}
