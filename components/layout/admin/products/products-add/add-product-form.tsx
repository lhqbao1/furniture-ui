'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
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
                                    <FormLabel>Description</FormLabel>
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

                        <ImagePickerInput form={form} fieldName="image"
                        />
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