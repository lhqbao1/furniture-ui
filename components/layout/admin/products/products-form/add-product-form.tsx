'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import z from 'zod'
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import "react-quill-new/dist/quill.snow.css"
import RichTextEditor from '@/components/shared/editor'
import ImagePickerInput from '@/components/layout/single-product/tabs/review/image-picker-input'
import { Categories, tags } from '@/data/data'
import { Switch } from '@/components/ui/switch'
import { addProductSchema, defaultValues, ProductInput } from '@/lib/schema/product'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { NewProductItem, ProductItem, Variant } from '@/types/products'
import { toast } from 'sonner'
import { ProductPricingFields } from './pricing-field'
import { MultiSelectField } from './category-select'

interface AddProductFormProps {
    productValues?: Partial<NewProductItem>
    onSubmit: (values: ProductInput) => Promise<void> | void
    isPending?: boolean
}

const ProductForm = ({ productValues, onSubmit, isPending }: AddProductFormProps) => {
    const [description, setDescription] = useState("")
    const [isSimple, setIsSimple] = useState(true)

    const form = useForm<z.infer<typeof addProductSchema>>({
        resolver: zodResolver(addProductSchema),
        defaultValues: productValues || defaultValues,
        mode: "onBlur",
    })

    useEffect(() => {
        if (productValues) {
            form.reset(productValues)
        }
    }, [productValues, form])

    const handleSubmit = async (values: ProductInput) => {
        await onSubmit(values)
        form.reset({
            name: "",
            description: "",
            id_provider: '',
            tax: "19%",
            category: "",
            collection: null as string | null,
            sku: "",
            ean: "",
            is_active: false,
            tag: "",
            static_files: [] as StaticFile[],
            category_ids: [] as string[],
        })
    }

    return (
        <div className='pb-20'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(
                    (values) => {
                        console.log("✅ Valid submit", values)
                        handleSubmit(values)
                    },
                    (errors) => {
                        toast.error("Please check the form for errors")
                    }
                )}>
                    <div className='grid-cols-12 grid gap-5 w-full'>
                        <div className='col-span-8 flex flex-col gap-4'>
                            <h3 className='text-xl text-[#666666]'>Add New Product</h3>

                            <div className='flex gap-4 w-full'>
                                {/*Product ID */}
                                <div className='w-full'>
                                    <FormField
                                        control={form.control}
                                        name="id_provider"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className='text-[#666666] text-sm'>Product ID</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="" {...field} className='' />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/*Product Cost */}
                                <div className='w-full'>
                                    <FormField
                                        control={form.control}
                                        name="cost"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[#666666] text-sm">Cost Price</FormLabel>
                                                <FormControl>
                                                    <div className="relative flex items-center">
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            min={0}
                                                            className="pl-7 w-1/2"
                                                            onChange={(e) => {
                                                                field.onChange(e.target.valueAsNumber)
                                                            }}
                                                        />
                                                        <span className="absolute left-3 text-gray-500">€</span>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/*Product Name */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-[#666666] text-sm'>Product Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <ProductPricingFields form={form} />

                            <FormField
                                control={form.control}
                                name='tax'
                                render={({ field }) => (
                                    <div className='flex gap-4'>
                                        <FormLabel className='text-[#666666] text-sm'>Tax</FormLabel>
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
                                            <RichTextEditor
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                                content={description}
                                                setContent={setDescription}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/*Product Images */}
                            <div className='flex flex-col gap-2'>
                                <p className='text-[#666666] text-sm'>Image</p>
                                <ImagePickerInput form={form} fieldName="static_files" description='prefer 2k - 2500 x 1875px - Ratio 4:3' />
                            </div>
                        </div>
                        <div className='col-span-4 flex flex-col items-end gap-4'>
                            {/*Form Button */}
                            <div className='flex gap-2 justify-end'>
                                <Button className='cursor-pointer bg-gray-400 hover:bg-gray-500 text-white' type="button" hasEffect>Discard</Button>
                                <Button className='cursor-pointer bg-primary/95 hover:bg-primary text-lg' type="submit" hasEffect>
                                    {isPending ? <Loader2 className='animate-spin' /> : 'Submit'}
                                </Button>
                            </div>

                            {/*Product Active */}
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
                                                className='data-[state=unchecked]:bg-gray-400'
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/*Product Category */}
                            <MultiSelectField
                                fieldName="category_ids"
                                label="Categories"
                            />

                            <div className="flex items-center gap-4">
                                {/* Stock toggle */}
                                <FormField
                                    control={form.control}
                                    name="stock"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2">
                                            <FormLabel className="!mt-0 text-[#666666]">Stock</FormLabel>
                                            <FormControl>
                                                <Input
                                                    readOnly={isSimple ? false : true}
                                                    type="number"
                                                    placeholder="quantity"
                                                    min={0}
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                    className={`${isSimple ? '' : 'bg-gray-100 cursor-not-allowed'}`}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* SKU input */}
                            <FormField
                                control={form.control}
                                name='sku'
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-3">
                                        <FormLabel className='text-[#666666]'>SKU</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="SKU"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* Barcode input */}
                            <FormField
                                control={form.control}
                                name='ean'
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-3">
                                        <FormLabel className='text-[#666666]'>EAN</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Barcode"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* Weight input */}
                            <FormField
                                control={form.control}
                                name='weight'
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-3">
                                        <FormLabel className='text-[#666666] flex-1'>Weight (kg)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Weight"
                                                min={0}
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* Packaging input */}
                            <div className='flex gap-3 items-center'>
                                <span>Packaging (cm)</span>
                                <div className='flex flex-row gap-1'>
                                    <FormField
                                        control={form.control}
                                        name='length'
                                        render={({ field }) => (
                                            <FormItem className='flex flex-col items-center'>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder=""
                                                        min={0}
                                                        className="w-14"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                    />
                                                </FormControl>
                                                <FormLabel className='text-gray-500'>Length</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='height'
                                        render={({ field }) => (
                                            <FormItem className='flex flex-col items-center'>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder=""
                                                        min={0}
                                                        className="w-14"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                    />
                                                </FormControl>
                                                <FormLabel className='text-gray-500'>Height</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='width'
                                        render={({ field }) => (
                                            <FormItem className='flex flex-col items-center'>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder=""
                                                        min={0}
                                                        className="w-14"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                    />
                                                </FormControl>
                                                <FormLabel className='text-gray-500'>Width</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/*Tag choose */}
                            <div className='w-1/2'>
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
                            </div>
                        </div>
                    </div>
                </form>
            </Form>
        </div>

    )
}

export default ProductForm