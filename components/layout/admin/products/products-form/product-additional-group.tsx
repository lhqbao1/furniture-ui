'use client'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import GpsrInput from './form-input/gpsr'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { COLORS, tags } from '@/data/data'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import countries from "world-countries"
import { ColorSelect } from './form-input/color-seclect'

const ProductAdditionalInputs = () => {
    const form = useFormContext()

    const unit = [
        { id: "pcs." },
        { id: "set" },
        { id: "liter" },
        { id: "kg" },
        { id: "m2" },
    ]

    const priorityCountries = ["Vietnam", "Germany", "China"];

    const sortedCountries = [...countries].sort((a, b) => {
        const aPriority = priorityCountries.includes(a.name.common);
        const bPriority = priorityCountries.includes(b.name.common);
        if (aPriority && !bPriority) return -1;
        if (!aPriority && bPriority) return 1;
        return a.name.common.localeCompare(b.name.common);
    });

    const countryOptions = sortedCountries.map((c) => ({
        value: c.name.common,
        label: c.name.common,
    }));

    return (
        <div className='space-y-6'>
            <div className='grid grid-cols-3 gap-6'>
                {/* Brand */}
                <GpsrInput />

                {/* Product materials */}
                <FormField
                    control={form.control}
                    name="materials"
                    render={({ field }) => (
                        <FormItem className='flex flex-col col-span-1'>
                            <FormLabel className='text-black font-semibold text-sm'>
                                Materials
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} className='col-span-4' />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Product color */}
                {/* <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => {
                        const selectedColors = field.value ? field.value.split(", ") : []

                        return (
                            <FormItem className="flex flex-col col-span-1">
                                <FormLabel className="text-black font-semibold text-sm">Color</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full justify-between"
                                            >
                                                {selectedColors.length > 0
                                                    ? selectedColors.join(", ")
                                                    : "Select colors..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0 w-[300px]">
                                        <Command>
                                            <CommandInput placeholder="Search color..." />
                                            <CommandGroup className='overflow-y-scroll h-[400px]'>
                                                {COLORS.map((color) => {
                                                    const isSelected = selectedColors.includes(color.label)
                                                    return (
                                                        <CommandItem
                                                            key={color.value}
                                                            value={color.label}
                                                            onSelect={() => {
                                                                const newSelected = isSelected
                                                                    ? selectedColors.filter((c: string) => c !== color.label)
                                                                    : [...selectedColors, color.label]
                                                                field.onChange(newSelected.join(", "))
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    isSelected ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {color.label} ({color.value})
                                                        </CommandItem>
                                                    )
                                                })}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )
                    }}
                /> */}
                <ColorSelect />
            </div>

            {/* Manufacture Country */}
            <FormField
                control={form.control}
                name="manufacture_country"
                render={({ field }) => (
                    <FormItem className="flex flex-col w-full">
                        <FormLabel className="text-black font-semibold text-sm col-span-2">
                            Manufacturing Country
                        </FormLabel>
                        <FormControl className="col-span-4">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                            "w-full justify-between col-span-4",
                                            !field.value && "text-muted-foreground"
                                        )}
                                    >
                                        {field.value || "Select country..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Search country..." className='col-span-4' />
                                        <CommandEmpty>No country found.</CommandEmpty>
                                        <CommandList className='h-[400px]'>
                                            <CommandGroup>
                                                {countryOptions.map((c) => (
                                                    <CommandItem
                                                        key={c.value}
                                                        value={c.value}
                                                        onSelect={() => field.onChange(c.value)}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                field.value === c.value ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {c.label}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </FormControl>
                        <FormMessage className="col-span-6" />
                    </FormItem>
                )}
            />

            <div className='grid grid-cols-2 gap-6'>
                {/* Product unit */}
                <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                        <FormItem className='flex flex-col w-full col-span-1'>
                            <FormLabel className="text-black font-semibold text-sm col-span-2">
                                Unit
                            </FormLabel>
                            <FormControl>
                                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                                    <SelectTrigger placeholderColor className='border col-span-4 font-light'>
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {unit.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                <span className="">{c.id}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Product amount unit */}
                <FormField
                    control={form.control}
                    name="amount_unit"
                    render={({ field }) => (
                        <FormItem className='flex flex-col'>
                            <FormLabel className='text-black font-semibold text-sm'>
                                Amount Unit
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

            </div>

            <div className='flex gap-6'>
                {/* WEEE Nr */}
                <FormField
                    control={form.control}
                    name="weee_nr"
                    render={({ field }) => (
                        <FormItem className='flex flex-col w-full'>
                            <FormLabel className="text-black font-semibold text-sm col-span-2">
                                WEEE Nr
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} className='col-span-4' />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* EEK Label: */}
                <FormField
                    control={form.control}
                    name="weee_nr"
                    render={({ field }) => (
                        <FormItem className="flex flex-col w-full">
                            <FormLabel className="text-black font-semibold text-sm col-span-2">
                                EEK Label
                            </FormLabel>
                            <FormControl >
                                <Select onValueChange={field.onChange} defaultValue={field.value ?? ""}>
                                    <SelectTrigger placeholderColor className='border w-full col-span-4 font-light'>
                                        <SelectValue placeholder="EEK Label" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["A", "B", "C", "D", "E", "F"].map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage className="col-span-6" />
                        </FormItem>
                    )}
                />
            </div>

            <div className='grid grid-cols-4 gap-6'>
                {/* Product length */}
                <FormField
                    control={form.control}
                    name="length"
                    render={({ field }) => (
                        <FormItem className='flex flex-col'>
                            <FormLabel className='text-black font-semibold text-sm'>
                                Product Length
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder=""
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value === "" ? null : e.target.valueAsNumber
                                        )
                                    }
                                    type='number'
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Product width */}
                <FormField
                    control={form.control}
                    name="width"
                    render={({ field }) => (
                        <FormItem className='flex flex-col'>
                            <FormLabel className='text-black font-semibold text-sm'>
                                Product Width
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder=""
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value === "" ? null : e.target.valueAsNumber
                                        )
                                    }
                                    type='number'
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Product height */}
                <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                        <FormItem className='flex flex-col'>
                            <FormLabel className='text-black font-semibold text-sm'>
                                Product Height
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder=""
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value === "" ? null : e.target.valueAsNumber
                                        )
                                    }
                                    type='number'
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Product net weight */}
                <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                        <FormItem className='flex flex-col'>
                            <FormLabel className='text-black font-semibold text-sm'>
                                Product Net. Weight
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder=""
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value === "" ? null : e.target.valueAsNumber
                                        )
                                    }
                                    type='number'
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    )
}

export default ProductAdditionalInputs