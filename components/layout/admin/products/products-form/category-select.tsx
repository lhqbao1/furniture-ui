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

interface MultiSelectProps {
    fieldName: string
    label?: string
    placeholder?: string
}

export function MultiSelectField({
    fieldName,
    label,
    placeholder = "Select options",
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
                    <FormItem>
                        {label && <FormLabel>{label}</FormLabel>}

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-[200px] justify-between"
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
                                        No options available
                                    </div>
                                ) : (
                                    <Command>
                                        <CommandGroup>
                                            {leafOptions.map((opt) => (
                                                <CommandItem
                                                    key={opt.id}
                                                    onSelect={() => toggleSelect(opt.id)}
                                                    className="flex items-center justify-between"
                                                >
                                                    {opt.name}
                                                    {selected.includes(opt.id) && (
                                                        <Check className="h-4 w-4" />
                                                    )}
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
