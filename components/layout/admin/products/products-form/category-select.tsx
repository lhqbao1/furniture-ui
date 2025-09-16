"use client"

import * as React from "react"
import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command"
import { Check, Loader2 } from "lucide-react"
import { useGetCategories } from "@/features/category/hook"
import { CategoryResponse } from "@/types/categories"
import { Checkbox } from "@/components/ui/checkbox"
import { FormLabelWithAsterisk } from "@/components/shared/form-label-with-asterisk"

interface MultiSelectProps {
    fieldName: string
    label?: string
    placeholder?: string
}

export function MultiSelectField({
    fieldName,
    label,
    placeholder = "Select categories",
}: MultiSelectProps) {
    const { control } = useFormContext()
    const { data: options, isLoading, isError } = useGetCategories()

    // hàm flatten chỉ lấy leaf nodes
    const flattenCategories = (categories: CategoryResponse[]): CategoryResponse[] => {
        let result: CategoryResponse[] = []
        for (const cat of categories) {
            if (cat.children && cat.children.length > 0) {
                // nếu có children -> lấy children đệ quy
                result = [...result, ...flattenCategories(cat.children)]
            } else {
                // nếu không có children -> leaf node
                result.push(cat)
            }
        }
        return result
    }

    const leafOptions: CategoryResponse[] = React.useMemo(() => {
        if (!options) return []
        return flattenCategories(options)
    }, [options])

    return (
        <FormField
            control={control}
            name={fieldName}
            render={({ field }) => {
                const selected: string[] = field.value || []

                const toggleSelect = (id: string) => {
                    if (selected.includes(id)) {
                        field.onChange(selected.filter((x) => x !== id))
                    } else {
                        field.onChange([...selected, id])
                    }
                }

                return (
                    <FormItem className="grid grid-cols-6 w-full">
                        {label &&
                            <FormLabelWithAsterisk required className='text-[#666666] text-sm col-span-2 text-start'>
                                Categories
                            </FormLabelWithAsterisk>}

                        <Popover>
                            <PopoverTrigger asChild className="font-light">
                                <Button
                                    variant="outline"
                                    className="w-full justify-between col-span-4"
                                    disabled={isLoading || isError}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Loading...
                                        </span>
                                    ) : selected.length > 0 ? (
                                        `${selected.length} selected`
                                    ) : (
                                        placeholder
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
                                {isLoading ? (
                                    <div className="flex items-center justify-center p-4">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : isError || !leafOptions || leafOptions.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        No categories available
                                    </div>
                                ) : (
                                    <Command>
                                        <CommandGroup>
                                            {leafOptions.map((opt) => (
                                                <CommandItem
                                                    key={opt.id}
                                                    onSelect={() => toggleSelect(opt.id)}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <Checkbox
                                                        checked={selected.includes(opt.id)}
                                                        onCheckedChange={() => toggleSelect(opt.id)}
                                                        className="pointer-events-none"
                                                    />
                                                    <span>{opt.name}</span>
                                                </CommandItem>

                                            ))}
                                        </CommandGroup>
                                    </Command>
                                )}
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )
            }}
        />
    )
}
