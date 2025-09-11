'use client'

import * as React from "react"
import { z } from "zod"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import RangePicker from "@/components/shared/range-picker"
import ColorPickerButton from "@/components/shared/color-picker-button"
import ImageSinglePicker, { SizeType } from "@/components/shared/image-single-picker"

import { brands, colors, materials, originFilter, spaceFilter, specialFeatures, tags } from "@/data/data"
import Image from "next/image"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// ✅ Khai báo schema validate với zod
const filterSchema = z.object({
    priceRange: z.tuple([z.number(), z.number()]),
    color: z.string().optional(),
    material: z.string().optional(),
    brand: z.string().optional(),
    size: z.object({
        lengthValue: z.string().optional(),
        width: z.string().optional(),
        height: z.string().optional(),
    }),
    isOldest: z.boolean(),
    isPriceLowest: z.boolean(),
    isSearchedLowest: z.boolean(),
    category: z.string().optional(),
    space: z.array(z.string()).optional(),
    origin: z.array(z.string()).optional(),
    tag: z.string().optional(),
    features: z.array(z.string()).optional(),
})

type FilterFormValues = z.infer<typeof filterSchema>;



const FilterSection = () => {

    const form = useForm<FilterFormValues>({
        resolver: zodResolver(filterSchema),
        defaultValues: {
            priceRange: [0, 1000],
            color: "",
            material: "",
            brand: "",
            size: { lengthValue: "", width: "", height: "" },
            isOldest: false,
            isPriceLowest: false,
            isSearchedLowest: false,
            category: "",
            space: [],
            origin: [],
            tag: "",
            features: [],
        },
    });

    const onSubmit: SubmitHandler<FilterFormValues> = (values) => {
        console.log(values);
    };


    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="border border-gray-400 rounded-2xl w-full grid xl:grid-cols-12 grid-cols-2 p-6 pt-8 gap-8"
            >
                {/* First column */}
                <div className="flex flex-col gap-10 xl:col-span-3 col-span-1">
                    {/* Price */}
                    <FormField
                        control={form.control}
                        name="priceRange"
                        render={({ field }) => (
                            <FormItem className="flex flex-row gap-4 items-center">
                                <FormLabel className="font-bold text-base">Price</FormLabel>
                                <FormControl>
                                    <RangePicker
                                        minValue={0}
                                        maxValue={1000}
                                        step={10}
                                        // RangePicker của bạn cần support onChange
                                        onChange={(val) => field.onChange(val)}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />




                    {/* Color */}
                    <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                            <FormItem className="flex flex-row gap-4 items-center">
                                <FormLabel className="font-bold text-base">Color</FormLabel>
                                <div className="flex flex-row gap-4 flex-1 justify-end">
                                    {colors.map((item, idx) => (
                                        <ColorPickerButton
                                            key={idx}
                                            color={item}
                                            active={field.value === item}
                                            onClick={() => field.onChange(item)}
                                        />
                                    ))}
                                </div>
                            </FormItem>
                        )}
                    />




                    {/* Material */}
                    <FormField
                        control={form.control}
                        name="material"
                        render={({ field }) => (
                            <FormItem className="flex flex-row gap-4 items-center">
                                <FormLabel className="font-bold text-base">Material</FormLabel>
                                <div className="flex flex-row gap-4 flex-1 justify-end">
                                    {materials.map((item, idx) => (
                                        <ImageSinglePicker
                                            key={idx}
                                            size={SizeType.Icon}
                                            item={item}
                                            active={field.value === item}
                                            onClick={() => field.onChange(item)}
                                        />
                                    ))}
                                </div>
                            </FormItem>
                        )}
                    />




                    {/* Brand */}
                    <FormField
                        control={form.control}
                        name="brand"
                        render={({ field }) => (
                            <FormItem className="flex flex-row gap-4 items-center">
                                <FormLabel className="font-bold text-base">Brand</FormLabel>
                                <div className="flex flex-row gap-4 flex-1 justify-end items-center">
                                    {brands.map((item, idx) => (
                                        <ImageSinglePicker
                                            key={idx}
                                            size={SizeType.Image}
                                            item={item}
                                            active={field.value === item}
                                            onClick={() => field.onChange(item)}
                                        />
                                    ))}
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Second column (Size + Switches) */}
                <div className="flex flex-col gap-4 xl:col-span-3 col-span-1">
                    <FormField
                        control={form.control}
                        name="size"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold text-base">Size (cm)</FormLabel>
                                <div className="relative flex flex-row justify-center">
                                    <Image src="/Asset10.png" width={100} height={100} alt="" className="scale-115" unoptimized />
                                    <FormField
                                        control={form.control}
                                        name="size.lengthValue"
                                        render={({ field }) => (
                                            <Input
                                                type="number"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                className="absolute -top-8 right-19 w-18 h-6 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                placeholder="Length"
                                                {...field} />
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="size.width"
                                        render={({ field }) => (
                                            <Input
                                                type="number"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                className="absolute top-2.5 -left-1 w-16 h-6 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                placeholder="Width"
                                                {...field} />
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="size.height"
                                        render={({ field }) => (
                                            <Input
                                                type="number"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                className="absolute top-9 -right-2 w-18 h-6 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                placeholder="Height"
                                                {...field} />
                                        )}
                                    />
                                </div>
                            </FormItem>
                        )}
                    />

                    {/* Switch filters */}
                    <FormField
                        control={form.control}
                        name="isOldest"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold text-base">Status</FormLabel>
                                <div className="flex flex-row items-center gap-4">
                                    <p className={`font-semibold ${!field.value ? "text-primary" : "text-gray-600"}`}>Newest</p>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    <p className={`font-semibold ${field.value ? "text-primary" : "text-gray-600"}`}>Oldest</p>
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="isPriceLowest"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold text-base">Price</FormLabel>
                                <div className="flex flex-row items-center gap-4">
                                    <p className={`font-semibold ${!field.value ? "text-primary" : "text-gray-600"}`}>Highest</p>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    <p className={`font-semibold ${field.value ? "text-primary" : "text-gray-600"}`}>Lowest</p>
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="isSearchedLowest"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold text-base">Searched</FormLabel>
                                <div className="flex flex-row items-center gap-4">
                                    <p className={`font-semibold ${!field.value ? "text-primary" : "text-gray-600"}`}>Highest</p>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    <p className={`font-semibold ${field.value ? "text-primary" : "text-gray-600"}`}>Lowest</p>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Third column (Tags + Features) */}
                <div className="flex flex-col gap-8 xl:col-span-3 col-span-1">
                    <FormField
                        control={form.control}
                        name="tag"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold text-base">Tag</FormLabel>
                                <div className="flex flex-row gap-2 flex-wrap">
                                    {tags.map((item, idx) => (
                                        <div
                                            key={idx}
                                            style={{ background: item.color }}
                                            onClick={() => field.onChange(item.name)}
                                            className={`rounded-xl text-xs py-1 px-2 text-white cursor-pointer uppercase ${field.value === item.name ? "ring ring-primary ring-offset-2" : ""
                                                }`}
                                        >
                                            {item.name}
                                        </div>
                                    ))}
                                </div>
                            </FormItem>
                        )}
                    />


                    <FormField
                        control={form.control}
                        name="features"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold text-base">Special Features</FormLabel>
                                <div className="flex flex-row gap-2 flex-wrap">
                                    {specialFeatures.map((item, idx) => {
                                        const isSelected = field.value?.includes(item)
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() =>
                                                    field.onChange(
                                                        isSelected && field.value ? field.value.filter((i) => i !== item) : [...(field.value || []), item]
                                                    )
                                                }
                                                className={`cursor-pointer rounded-sm text-xs py-1 px-2 capitalize border ${isSelected ? "border-primary text-primary" : "border-black text-black"
                                                    }`}
                                            >
                                                {item}
                                            </div>
                                        )
                                    })}
                                </div>
                            </FormItem>
                        )}
                    />
                </div>


                {/* Fourth column (Category, Space, Origin) */}
                <div className="flex flex-col gap-8 xl:col-span-3 col-span-1">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold text-base">Categories</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className="!text-primary border w-full justify-between">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="chair">Chair</SelectItem>
                                        <SelectItem value="table">Table</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />

                    {/* Space filter */}
                    <FormField
                        control={form.control}
                        name="space"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold text-base">Space</FormLabel>
                                <div className="flex flex-col gap-2">
                                    {spaceFilter.map((item, idx) => {
                                        const checked = field.value?.includes(item)
                                        return (
                                            <div key={idx} className="flex flex-row items-center gap-2">
                                                <Checkbox
                                                    checked={checked}
                                                    onCheckedChange={(val) => {
                                                        field.onChange(val ? [...(field.value || []), item] : (field.value && field.value.length > 0 ? field.value.filter((i) => i !== item) : []))
                                                    }
                                                    }
                                                />
                                                <Label>{item}</Label>
                                            </div>
                                        )
                                    })}
                                </div>
                            </FormItem>
                        )}
                    />

                    {/* Origin filter */}
                    <FormField
                        control={form.control}
                        name="origin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold text-base">Origin</FormLabel>
                                <div className="flex flex-col gap-2">
                                    {originFilter.map((item, idx) => {
                                        const checked = field.value?.includes(item)
                                        return (
                                            <div key={idx} className="flex flex-row items-center gap-2">
                                                <Checkbox
                                                    checked={checked}
                                                    onCheckedChange={(val) =>
                                                        field.onChange(val ? [...(field.value || []), item] : (field.value && field.value.length > 0 ? field.value.filter((i) => i !== item) : []))
                                                    }
                                                />
                                                <Label>{item}</Label>
                                            </div>
                                        )
                                    })}
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Action buttons */}
                <div className="col-span-12 flex flex-row justify-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-full px-8 text-lg text-gray-600"
                        onClick={() => form.reset()}
                    >
                        Clear
                    </Button>
                    <Button type="submit" className="rounded-full px-20 text-lg font-bold">
                        Apply
                    </Button>
                </div>
            </form>
        </Form>
    )
}

export default FilterSection
