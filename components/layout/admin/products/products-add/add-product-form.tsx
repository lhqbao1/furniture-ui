'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
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
import { Categories, collectionList, colors, dimension, materials, tags, types } from '@/data/data'
import { Switch } from '@/components/ui/switch'
import { MySwitch } from '@/components/shared/my-swtich'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import VariantDrawer from './add-variant-form'
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Variant } from '@/lib/schema/variant'
import Image from 'next/image'
import { addProductSchema, defaultValues, Products } from '@/lib/schema/product'
import { useAddProduct } from '@/features/products/hook'
import { toast } from 'sonner'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

const AddProductForm = () => {
    const [showMaterial, setShowMaterial] = useState<boolean>(true)
    const [variants, setVariants] = useState<Variant[]>([])
    const createProduct = useAddProduct()
    const [openVariant, setOpenVariant] = useState(false)

    const form = useForm<z.infer<typeof addProductSchema>>({
        resolver: zodResolver(addProductSchema),
        defaultValues: defaultValues,
    })

    const { control, setValue } = form

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "variants",
    })


    function onSubmit(values: z.infer<typeof addProductSchema>) {
        createProduct.mutate(values, {
            onSuccess: (data) => {
                toast.success("Product is created")
                form.reset()
                setVariants([])
                console.log("Created product:", data)
            },
            onError: (error) => {
                toast.error(error.message)
            }
        })
    }

    // Watch price + discountPercent
    const price = useWatch({ control, name: "price" })
    const discountPercent = useWatch({ control, name: "discount_percent" })

    const stock = useWatch({
        control: form.control,
        name: "stock",
    })

    React.useEffect(() => {
        if (price && discountPercent) {
            const discountAmount = (price * discountPercent) / 100
            const finalPrice = price - discountAmount

            setValue("discount_amount", discountAmount)
            setValue("final_price", finalPrice)
        } else {
            setValue("discount_amount", 0)
            setValue("final_price", price || 0)
        }
    }, [price, discountPercent, setValue])
    return (
        <div className='pb-20'>
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
                                                        <Input
                                                            placeholder=""
                                                            {...field}
                                                            type='number'
                                                            min={0}
                                                            className='pl-7'
                                                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
                                        name="discount_percent"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className='text-[#666666] text-sm'>Discount</FormLabel>
                                                <FormControl>
                                                    <div className='relative flex items-center'>
                                                        <Input placeholder="" {...field} type='number' min={0} className='pl-7' onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                        />
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
                                        name="discount_amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className='text-[#666666] text-sm'>Discount Amount</FormLabel>
                                                <FormControl>
                                                    <div className='relative flex items-center'>
                                                        <Input
                                                            {...field}
                                                            // value={discountAmount}
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
                                        name="final_price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className='text-[#666666] text-sm'>Final Price</FormLabel>
                                                <FormControl>
                                                    <div className='relative flex items-center'>
                                                        <Input
                                                            {...field}
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

                            {/*Product Variants */}
                            <div className='border-t border-gray-400 pt-2'>
                                <p>Product Variants</p>
                                <div className='flex flex-col gap-3 mt-3'>
                                    {variants && variants.length > 0 ?
                                        variants.map((item, index) => {
                                            return (
                                                <div className='grid grid-cols-12 gap-4 items-center' key={item.id}>
                                                    <div className='col-span-3 flex gap-2 items-center justify-start'>
                                                        <p className='text-[#666666] text-sm'>{item.name}</p>
                                                        <MySwitch checked={showMaterial} onCheckedChange={() => setShowMaterial(!showMaterial)} />
                                                    </div>
                                                    {showMaterial ?
                                                        <div className='item-color flex flex-row gap-4 col-span-9'>
                                                            {item.options.map((options, index) => {
                                                                if (options.image_url) {
                                                                    return (
                                                                        <div key={options.id}>
                                                                            <Image
                                                                                src={options.image_url}
                                                                                width={50}
                                                                                height={50}
                                                                                alt=''
                                                                                className='shadow-sm bg-white rounded-sm'
                                                                            />
                                                                        </div>
                                                                        // <ImageSinglePicker key={index} size={SizeType.Icon} item={options} name='materials' isFormInput />
                                                                    )
                                                                } else {
                                                                    return (
                                                                        <div key={options.id} className='px-2 py-1 rounded-md'>{options.label}</div>
                                                                    )
                                                                }
                                                            })}
                                                        </div>
                                                        : ''
                                                    }
                                                </div>
                                            )
                                        })

                                        : ''}
                                </div>

                            </div>

                        </div>
                        <div className='col-span-4 flex flex-col items-end gap-4'>
                            {/*Form Button */}
                            <div className='flex gap-2 justify-end'>
                                <Button className='cursor-pointer bg-gray-400 hover:bg-gray-500 text-white' type="button" hasEffect>Discard</Button>
                                <Button className='cursor-pointer bg-primary/95 hover:bg-primary text-lg' type="submit" hasEffect>Submit</Button>
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

                            {/*Product ID */}
                            <span className='text-[#666666]'>ID 1136574654</span>

                            {/*Product Category */}
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row gap-3">
                                        <FormLabel className="!mt-0 text-[#666666]">Category</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger className='border text-black' placeholderColor='black'>
                                                    <SelectValue placeholder="Select category" className='text-black' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Categories.map((item, index) => (
                                                        <SelectItem key={index} value={item.name}>
                                                            {item.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/*Product Collection */}
                            {/* <FormField
                                control={form.control}
                                name="collection"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row gap-3">
                                        <FormLabel className="!mt-0 text-[#666666]">Collection</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger className='border text-black' placeholderColor='black'>
                                                    <SelectValue placeholder="Select category" className='text-black' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {collectionList.map((item, index) => (
                                                        <SelectItem key={index} value={item.name}>
                                                            {item.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                    </FormItem>
                                )}
                            /> */}

                            <div className="flex items-center gap-4">
                                {/* Stock toggle */}
                                <FormField
                                    control={form.control}
                                    name="stock"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2">
                                            <FormLabel className="!mt-0 text-[#666666]">Stock</FormLabel>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className="data-[state=unchecked]:bg-gray-400"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                {/* Quantity input */}
                                <FormField
                                    control={form.control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem className="">
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="quantity"
                                                    min={0}
                                                    disabled={!stock} // <-- disable khi stock = false
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
                                name='barcode'
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-3">
                                        <FormLabel className='text-[#666666]'>Barcode</FormLabel>
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
                                        name='packaging.packageLength'
                                        render={({ field }) => (
                                            <FormItem className='flex flex-col items-center'>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder=""
                                                        min={0}
                                                        className="w-14"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormLabel className='text-gray-500'>Length</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='packaging.packageHeight'
                                        render={({ field }) => (
                                            <FormItem className='flex flex-col items-center'>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder=""
                                                        min={0}
                                                        className="w-14"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormLabel className='text-gray-500'>Height</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='packaging.packageWidth'
                                        render={({ field }) => (
                                            <FormItem className='flex flex-col items-center'>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder=""
                                                        min={0}
                                                        className="w-14"

                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormLabel className='text-gray-500'>Width</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/*Tag choose */}
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
                </form>
            </Form>
            {/* Nút mở Drawer */}
            <Drawer open={openVariant} onOpenChange={setOpenVariant} direction='right' disablePreventScroll>
                <DrawerTrigger asChild>
                    <Button type="button">Add Variant</Button>
                </DrawerTrigger>
                <DrawerContent className="p-4 !max-w-[500px] !w-[500px] overflow-y-auto">
                    <DrawerHeader>
                        <DrawerTitle>Add New Variant</DrawerTitle>
                    </DrawerHeader>
                    <VariantDrawer
                        onAdd={(variant) => {
                            append(variant)
                            setOpenVariant(false) // đóng drawer
                        }}
                        setVariant={setVariants}
                    />
                </DrawerContent>
            </Drawer>
        </div>

    )
}

export default AddProductForm