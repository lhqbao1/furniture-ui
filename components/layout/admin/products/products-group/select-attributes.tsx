"use client"

import * as React from "react"
import { Controller, useFormContext } from "react-hook-form"

import {
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form"
import { useGetVariants } from "@/features/variant/hook"
import AttributesModal from "./attribute-modal"



const SelectProductAttributes = () => {
    const [openAddAttr, setOpenAddAttr] = React.useState(false)
    const form = useFormContext()
    const { watch } = useFormContext()


    const { data: attributes, isLoading, isError } = useGetVariants()

    if (isLoading) return <div>Loading</div>

    return (
        <Controller
            control={form.control}
            name="attr"
            render={({ field }) => {
                return (
                    <FormItem className="grid grid-cols-6 gap-8 w-full">
                        <FormLabel className="col-span-1 text-right justify-end text-base">Attributes</FormLabel>
                        <FormControl className=" w-full">
                            <AttributesModal dialogOpen={openAddAttr} setDialogOpen={setOpenAddAttr} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )
            }}
        />
    )
}

export default SelectProductAttributes
