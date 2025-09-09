"use client"

import React from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, FormProvider } from "react-hook-form"
import { Button } from "@/components/ui/button"
import SelectProductGroup from "@/components/layout/admin/products/products-group/select-group"
import { toast } from "sonner"
import GroupDetails from "@/components/layout/admin/products/products-group/group-details"

const formSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    parent_id: z.string().min(1, "Too short"),
    attr: z.string().min(1, "Too Short")
})

type FormValues = z.infer<typeof formSchema>

const ProductGroup = () => {
    const methods = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            parent_id: "",
            attr: ""
        },
    })

    const handleSubmit = (values: FormValues) => {
        console.log("Form submit:", values)
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(
                (values) => {
                    console.log("✅ Valid submit", values)
                    handleSubmit(values)
                },
                (errors) => {
                    console.log(errors)
                    toast.error("Please check the form for errors")
                }
            )}>
                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-4">
                        <SelectProductGroup />
                    </div>
                    <div className="col-span-8 px-12">
                        <GroupDetails />
                    </div>
                </div>
            </form>
        </FormProvider>
    )
}

export default ProductGroup
