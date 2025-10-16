"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useFormContext } from "react-hook-form"
import { COLORS } from "@/data/data"

export function ColorSelect() {
    const form = useFormContext()
    const [open, setOpen] = React.useState(false)
    const selectedColor = form.watch("color")

    const selectedLabel =
        COLORS.find((c) => c.value === selectedColor)?.label ?? "Select a color"

    return (
        <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel className="text-black font-semibold text-sm">Color</FormLabel>

                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between"
                                >
                                    {selectedLabel}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>

                        <PopoverContent className="p-0 w-[200px]">
                            <Command>
                                <CommandInput placeholder="Search color..." />
                                <CommandList>
                                    <CommandEmpty>No color found.</CommandEmpty>
                                    <CommandGroup>
                                        {COLORS.map((color) => (
                                            <CommandItem
                                                key={color.value}
                                                value={color.value}
                                                onSelect={(currentValue) => {
                                                    field.onChange(
                                                        currentValue === field.value ? "" : currentValue
                                                    )
                                                    setOpen(false)
                                                }}
                                            >
                                                {/* <div
                                                    className="w-4 h-4 rounded-sm mr-2 border"
                                                /> */}
                                                {color.label}
                                                <Check
                                                    className={`ml-auto h-4 w-4 ${field.value === color.value
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                        }`}
                                                />
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
