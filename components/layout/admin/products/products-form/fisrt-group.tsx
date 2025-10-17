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
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { tags } from '@/data/data'

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
    const bundles = form.watch('bundles')

    const handleDownloadImages = async () => {
        const files = form.getValues('static_files') as { url: string }[];

        if (!files || files.length === 0) {
            toast.error("Product does not have any image")
            return;
        }

        for (const [index, file] of files.entries()) {
            try {
                const response = await fetch(file.url);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);

                // --- Đoán định dạng ảnh ---
                const match = file.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
                const ext = match ? match[1].toLowerCase() : "jpg";

                const link = document.createElement("a");
                link.href = url;
                link.download = `image_${index + 1}.${ext}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error("Lỗi tải ảnh:", file.url, error);
            }
        }

        toast.success("Download images successful")
    };



    return (
        <div className='space-y-6'>
            {/*Product Name */}
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem className='flex flex-col'>
                        <FormLabel className='text-black font-semibold text-sm'>
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
                                <FormLabel className="!mt-0 text-black font-semibold">Active</FormLabel>
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
                            <FormLabel className='text-black font-semibold text-sm'>
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
                            <FormLabel className='text-black font-semibold text-sm'>
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
                            <FormLabel className='text-black font-semibold text-sm'>
                                Stock
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    inputMode="decimal"
                                    disabled={bundles && bundles.length > 0}
                                    value={field.value ?? ""}
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value === "" ? null : e.target.valueAsNumber
                                        )
                                    }
                                />
                            </FormControl>
                            <FormMessage></FormMessage>
                        </FormItem>
                    )}
                />
            </div>

            {/*Product price fields */}
            <ProductPricingFields isDsp={isDSP} />

            <div className='grid grid-cols-12 gap-6'>


                {/* <div className="col-span-3">
                    <FormField
                        control={form.control}
                        name="delivery_multiple"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='text-black font-semibold text-sm'>Delivery Type</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={(value) => field.onChange(value === "true")}
                                        value={field.value ? "true" : "false"}
                                        className="flex flex-col gap-4"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="true" id="multiple" />
                                            <FormLabel htmlFor="multiple" className="font-normal">
                                                Multiple time
                                            </FormLabel>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="false" id="single" />
                                            <FormLabel htmlFor="single" className="font-normal">
                                                Single time
                                            </FormLabel>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div> */}
            </div>

            {/*Product VAT */}
            <FormField
                control={form.control}
                name='tax'
                render={({ field }) => (
                    <div className='flex gap-4 flex-col'>
                        <FormLabel className='text-black font-semibold text-sm'>
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
                        <FormLabel className='text-black font-semibold text-sm'>Description</FormLabel>
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
            <div className='flex flex-col gap-4'>
                <div className='flex gap-3 items-center'>
                    <p className='text-black font-semibold text-sm'>Image</p>
                </div>
                <ImagePickerInput form={form} fieldName="static_files" description='prefer 2k - 2500 x 1875px - Ratio 4:3' isAddProduct />
            </div>

            {/*Tag choose */}
            <div className="w-full">
                <FormField
                    control={form.control}
                    name="tag"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-bold text-base">Tag</FormLabel>
                            <div className="flex flex-row gap-2 flex-wrap">
                                {tags.map((item, idx) => {
                                    const isSelected = field.value === item.name
                                    return (
                                        <div
                                            key={idx}
                                            style={{ background: item.color }}
                                            onClick={() =>
                                                field.onChange(isSelected ? "" : item.name) // toggle
                                            }
                                            className={`rounded-xl text-xs py-1 px-2 text-white cursor-pointer uppercase ${isSelected ? `ring-2 ring-primary ring-offset-2` : ""
                                                }`}
                                        >
                                            {item.name}
                                        </div>
                                    )
                                })}
                            </div>
                        </FormItem>
                    )}
                />
            </div>
        </div>
    )
}

export default ProductDetailInputs