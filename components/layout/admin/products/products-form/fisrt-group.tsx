'use client'
import React, { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ProductPricingFields } from './pricing-field'
import { MultiSelectField } from './category-select'
import ImagePickerInput from '@/components/layout/single-product/tabs/review/image-picker-input'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import dynamic from "next/dynamic"

// import RichEditor dynamically to avoid SSR issues
const RichEditor = dynamic(() => import("@/components/shared/tiptap/tiptap-editor"), {
    ssr: false,
    loading: () => <div className="min-h-[200px] border rounded-md p-4">Loading editor...</div>,
})
interface ProductDetailInputsProps {
    isEdit?: boolean
    productId?: string | null
    isDSP?: boolean
}

const ProductDetailInputs = ({ isEdit, productId, isDSP = false }: ProductDetailInputsProps) => {
    const form = useFormContext()

    return (
        <div className='space-y-6'>
            {/*Product Name */}
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem className='flex flex-col'>
                        <FormLabel className='text-[#666666] text-sm'>
                            Product Name
                        </FormLabel>
                        <FormControl>
                            <Input placeholder="" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/*Product ID & status */}
            <div className='flex gap-6'>
                {productId ? <div>ID: {productId}</div> : ''}

                {/*Product Active */}
                {isDSP ? '' :
                    <FormField
                        control={form.control}
                        name="is_active"
                        render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                                <FormLabel className="!mt-0 text-[#666666]">Active</FormLabel>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className='data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-secondary cursor-pointer'
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                }

            </div>

            <div className='flex gap-6'>
                {/*Product Category */}
                <MultiSelectField
                    fieldName="category_ids"
                    label="Categories"
                />

                {/* SKU input */}
                <FormField
                    control={form.control}
                    name='sku'
                    render={({ field }) => (
                        <FormItem className="flex flex-col w-full">
                            <FormLabel className='text-[#666666] text-sm'>
                                SKU
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    {...field}
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value)}
                                />
                            </FormControl>
                            <FormMessage></FormMessage>
                        </FormItem>
                    )}
                />

                {/* EAN input */}
                <FormField
                    control={form.control}
                    name='ean'
                    render={({ field }) => (
                        <FormItem className="flex flex-col w-full">
                            <FormLabel className='text-[#666666] text-sm'>
                                EAN
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    {...field}
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value)}
                                />
                            </FormControl>
                            <FormMessage></FormMessage>
                        </FormItem>
                    )}
                />

                {/* Stock input */}
                <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                        <FormItem className="flex flex-col w-full">
                            <FormLabel className='text-[#666666] text-sm'>
                                Stock
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    inputMode="decimal"
                                    value={field.value ?? ""}
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value === "" ? null : e.target.valueAsNumber
                                        )
                                    }
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>

            {/*Product price fields */}
            <ProductPricingFields />

            {/*Product VAT */}
            <FormField
                control={form.control}
                name='tax'
                render={({ field }) => (
                    <div className='flex gap-4 flex-col'>
                        <FormLabel className='text-[#666666] text-sm'>
                            VAT
                        </FormLabel>
                        <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="flex gap-6"
                            defaultValue='19%'
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="19%" id="19%" />
                                <Label htmlFor="19%">19%</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="7%" id="7%" />
                                <Label htmlFor="7%">7%</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="0%" id="0%" />
                                <Label htmlFor="0%">0%</Label>
                            </div>
                        </RadioGroup>
                    </div>
                )}
            />

            {/*Product Description */}
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className='text-[#666666] text-sm'>Description</FormLabel>
                        <FormControl>
                            <RichEditor
                                value={field.value || ""}
                                onChangeValue={field.onChange}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/*Product Images */}
            <div className='flex flex-col gap-2'>
                <p className='text-[#666666] text-sm'>Image</p>
                <ImagePickerInput form={form} fieldName="static_files" description='prefer 2k - 2500 x 1875px - Ratio 4:3' isAddProduct />
            </div>
        </div>
    )
}

export default ProductDetailInputs