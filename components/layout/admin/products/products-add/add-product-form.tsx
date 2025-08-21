'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
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
import ImageSinglePicker, { SizeType } from '@/components/shared/image-single-picker'
import { colors, dimension, materials, types } from '@/data/data'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { MySwitch } from '@/components/shared/my-swtich'
import ColorPickerButton from '@/components/shared/color-picker-button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const formSchema = z.object({
    name: z.string().min(2, { message: "Product name is required" }),
    price: z.number().min(0),
    discountPercent: z.number().min(0).max(100).optional(),
    discountAmount: z.number().optional(),
    finalPrice: z.number().optional(),
    description: z.string().optional(),
    image: z.array(z.string()),
    materials: z.string(),
    color: z.string(),
    size: z.object({
        sizeLength: z.string().optional(),
        sizeWidth: z.string().optional(),
        sizeHeight: z.string().optional(),
    }),
    type: z.string(),
    category: z.string().optional(),
    collection: z.string().optional(),
    stock: z.boolean(),
    quantity: z.number().min(0),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    packaging: z.object({
        packageLength: z.string().optional(),
        packageWidth: z.string().optional(),
        packageHeight: z.string().optional(),
    }),
    weight: z.number().optional(),
    tag: z.string()
})

const AddProductForm = () => {
    const [showMaterial, setShowMaterial] = useState<boolean>(true)
    const [showColor, setShowColor] = useState<boolean>(true)
    const [showSize, setShowSize] = useState<boolean>(true)
    const [showType, setShowType] = useState<boolean>(true)

    const defaultValues = {
        name: "",
        price: 0,
        discountPercent: 0,
        discountAmount: 0,
        finalPrice: 0,
        description: "",
        image: [],

        materials: "",
        color: "",

        size: {
            sizeLength: "",
            sizeWidth: "",
            sizeHeight: "",
        },

        type: "",
        category: "",
        collection: "",

        stock: false,
        quantity: 0,
        sku: "",
        barcode: "",

        packaging: {
            packageLength: "",
            packageWidth: "",
            packageHeight: "",
        },

        weight: 0,
        tag: "",
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues,
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
    }

    const price = form.watch("price")
    const discountPercent = form.watch("discountPercent")

    const discountAmount = price && discountPercent
        ? (price * discountPercent) / 100
        : 0

    const finalPrice = price - discountAmount
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="">
                <div className='grid-cols-12 grid gap-5 w-full'>
                    <div className='col-span-8 flex flex-col gap-4'>
                        <h3 className='text-xl text-[#666666]'>Add New Product</h3>
                        {/*Product Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='text-[#666666] text-sm'>Product Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ghế sofa" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/*Product Price and Discount */}
                        <div className='grid grid-cols-12 gap-6'>
                            <div className='col-span-3'>
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-[#666666] text-sm'>Price</FormLabel>
                                            <FormControl>
                                                <div className='relative flex items-center'>
                                                    <Input placeholder="" {...field} type='number' min={0} className='pl-7' />
                                                    <span className='absolute left-3 text-gray-500'>€</span>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className='col-span-3'>
                                <FormField
                                    control={form.control}
                                    name="discountPercent"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-[#666666] text-sm'>Discount</FormLabel>
                                            <FormControl>
                                                <div className='relative flex items-center'>
                                                    <Input placeholder="" {...field} type='number' min={0} className='pl-7' />
                                                    <span className='absolute left-3 text-gray-500'>%</span>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className='col-span-3'>
                                <FormField
                                    control={form.control}
                                    name="discountAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-[#666666] text-sm'>Discount Amount</FormLabel>
                                            <FormControl>
                                                <div className='relative flex items-center'>
                                                    <Input
                                                        value={discountAmount}
                                                        readOnly
                                                        min={0}
                                                        type='number'
                                                        className='pl-7 bg-gray-100 cursor-not-allowed'
                                                    />
                                                    <span className='absolute left-3 text-gray-500'>€</span>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className='col-span-3'>
                                <FormField
                                    control={form.control}
                                    name="finalPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-[#666666] text-sm'>Final Price</FormLabel>
                                            <FormControl>
                                                <div className='relative flex items-center'>
                                                    <Input
                                                        value={finalPrice}
                                                        readOnly
                                                        type='number'
                                                        min={0}
                                                        className='pl-7 bg-gray-100 cursor-not-allowed'
                                                    />
                                                    <span className='absolute left-3 text-gray-500'>€</span>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

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
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/*Product Images */}
                        <div className='flex flex-col gap-2'>
                            <p className='text-[#666666] text-sm'>Image</p>
                            <ImagePickerInput form={form} fieldName="image" description='prefer 2k - 2500 x 1875px - Ratio 4:3' />
                        </div>

                        {/*Product Variants */}
                        <div className='border-t border-gray-400 pt-2'>
                            <p>Product Variants</p>
                            <div className='pt-5 space-y-6'>
                                {/*Product Materials */}
                                <div className='grid grid-cols-12 gap-16 items-center'>
                                    <div className='col-span-3 flex gap-2 items-center'>
                                        <p className='text-[#666666] text-sm'>Materials</p>
                                        <MySwitch checked={showMaterial} onCheckedChange={() => setShowMaterial(!showMaterial)} />
                                    </div>
                                    {showMaterial ?
                                        <div className='item-color flex flex-row gap-4 col-span-9'>
                                            {materials.map((item, index) => {
                                                return (
                                                    <ImageSinglePicker key={index} size={SizeType.Icon} item={item} name='materials' isFormInput />
                                                )
                                            })}
                                        </div>
                                        : ''
                                    }
                                </div>

                                {/*Product Colors */}
                                <div className='grid grid-cols-12 gap-16 items-center'>
                                    <div className='flex gap-2 items-center col-span-3'>
                                        <p className='text-[#666666] text-sm'>Color</p>
                                        <MySwitch checked={showColor} onCheckedChange={() => setShowColor(!showColor)} />
                                    </div>

                                    {showColor ?
                                        <div className='item-color flex flex-row gap-4 col-span-9'>
                                            {colors.map((item, index) => {
                                                return (
                                                    <ColorPickerButton key={index} color={item} name='color' isFormInput />
                                                )
                                            })}
                                        </div>
                                        : ''
                                    }
                                </div>

                                {/*Product Size */}
                                <div className='grid grid-cols-12 gap-16 items-center'>
                                    <div className='flex gap-2 items-center col-span-3'>
                                        <p className='text-[#666666] text-sm'>Size</p>
                                        <MySwitch checked={showSize} onCheckedChange={() => setShowSize(!showSize)} />
                                    </div>

                                    {showSize ?
                                        <div className="grid grid-cols-3 gap-4 col-span-9">
                                            {/* Length */}
                                            <FormField
                                                control={form.control}
                                                name="size.sizeLength"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Length</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" placeholder="Length" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Width */}
                                            <FormField
                                                control={form.control}
                                                name="size.sizeWidth"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Width</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" placeholder="Width" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Height */}
                                            <FormField
                                                control={form.control}
                                                name="size.sizeHeight"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Height</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" placeholder="Height" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        : ''
                                    }
                                </div>

                                {/*Product Type */}
                                <div className='grid grid-cols-12 gap-16 items-center'>
                                    <div className='flex gap-2 items-center col-span-3'>
                                        <p className='text-[#666666] text-sm'>Type</p>
                                        <MySwitch checked={showType} onCheckedChange={() => setShowType(!showType)} />
                                    </div>

                                    {showType && (
                                        <FormField
                                            control={form.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem className="col-span-9">
                                                    <FormControl>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <SelectTrigger className='border text-black' placeholderColor='#666666'>
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {types.map((item, index) => (
                                                                    <SelectItem key={item.id} value={item.name}>
                                                                        {item.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                </div>
                            </div>
                        </div>

                    </div>
                    <div className='col-span-4'>
                        as
                    </div>
                </div>

                <Button type="submit">Submit</Button>
            </form>
        </Form>
    )
}

export default AddProductForm