"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Controller, useFormContext } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import {
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form"
import { useCreateVariant, useGetVariants } from "@/features/variant/hook"
import AttributesModal from "./attribute-modal"
import { toast } from "sonner"
import { useQuery } from "@tanstack/react-query"
import { getProductGroupDetail } from "@/features/product-group/api"


const SelectProductAttributes = () => {
    const [open, setOpen] = React.useState(false)
    const [openAddAttr, setOpenAddAttr] = React.useState(false)
    const form = useFormContext()
    const { watch } = useFormContext()
    const parent_id = watch('parent_id')
    const createVariantMutation = useCreateVariant()

    const { data: groupDetail } = useQuery({
        queryKey: ["product-group-detail", parent_id],
        queryFn: () => getProductGroupDetail(parent_id),
        enabled: !!parent_id,
    })

    const existingVariantIds =
        groupDetail?.variants?.map((v) => v.variant.name) ?? []

    const handleCreateVariant = (name: string) => {
        createVariantMutation.mutate({ parent_id, name }, {
            onSuccess(data, variables, context) {
                toast.success("Product attributes created")
            },
            onError(error, variables, context) {
                toast.error("Product attributes created fail")
            },
        })
    }

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
                            {/* <Popover open={open} onOpenChange={setOpen}>
                                <div className="col-span-5 flex gap-2">
                                    <PopoverTrigger asChild onClick={(e) => e.preventDefault()}>
                                        <Button
                                            data-slot="popover-trigger"
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            className="flex-1 justify-between"
                                            onClick={() => {
                                                if (!parent_id) {
                                                    toast.error("You need to choose a parent before choose or create an attribute")
                                                    return
                                                }
                                                setOpen(true)
                                            }}
                                        >
                                            <p>
                                                {field.value
                                                    ? attributes?.find((item: string) => item == field.value)
                                                    : "Choose attributes..."}
                                            </p>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <AttributesModal dialogOpen={openAddAttr} setDialogOpen={setOpenAddAttr} />
                                </div>
                                <PopoverContent className="w-full min-w-78">
                                    <Command>
                                        <CommandInput placeholder="Search color..." />
                                        <CommandEmpty>No attributes found.</CommandEmpty>
                                        <CommandGroup>
                                            {attributes
                                                ?.filter((item: string) => !existingVariantIds.includes(item)) // lọc bỏ variant đã tồn tại
                                                .map((item: string, index: number) => (
                                                    <CommandItem
                                                        key={index}
                                                        onSelect={() => {
                                                            field.onChange(item)
                                                            setOpen(false)
                                                            handleCreateVariant(item)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                field.value === item ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {item}
                                                    </CommandItem>
                                                ))}
                                        </CommandGroup>

                                    </Command>
                                </PopoverContent>
                            </Popover> */}
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )
            }}
        />
    )
}

export default SelectProductAttributes
