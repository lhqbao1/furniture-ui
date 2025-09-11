'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
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
import { tags } from '@/data/data'
import { Switch } from '@/components/ui/switch'
import { addProductSchema, defaultValues, ProductInput } from '@/lib/schema/product'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { NewProductItem, StaticFile } from '@/types/products'
import { toast } from 'sonner'
import { ProductPricingFields } from './pricing-field'
import { MultiSelectField } from './category-select'
import { CategoryResponse } from '@/types/categories'
import { FormLabelWithAsterisk } from '@/components/shared/form-label-with-asterisk'
import { useAddProduct, useEditProduct } from '@/features/products/hook'
import { useRouter } from 'next/navigation'

interface AddProductFormProps {
    productValues?: Partial<NewProductItem>
    onSubmit: (values: ProductInput) => Promise<void> | void
    isPending?: boolean
}

const ProductForm = ({ productValues, onSubmit, isPending }: AddProductFormProps) => {
    const [description, setDescription] = useState("")
    const [isSimple, setIsSimple] = useState(true)
    const router = useRouter()
    const editProductMutation = useEditProduct()
    const addProductMutation = useAddProduct()

    const normalizeProductValues = (productValues?: Partial<NewProductItem>) => {
        if (!productValues) return defaultValues

        return {
            ...defaultValues,
            ...productValues,
            category_ids:
                productValues.categories?.map((c: CategoryResponse | number) =>
                    typeof c === "object" ? String(c.id) : String(c)
                ) || [],
        }
    }

    const form = useForm<z.infer<typeof addProductSchema>>({
        resolver: zodResolver(addProductSchema),
        defaultValues: normalizeProductValues(productValues) || defaultValues,
        mode: "onBlur",
    })

    const id_provider = form.watch('id_provider')


    useEffect(() => {
        if (productValues) {
            form.reset(productValues)
        }
    }, [productValues, form])

    const handleSubmit = async (values: ProductInput) => {
        const payload = {
            ...values,
            weight: values.weight || values.weight === 0 ? values.weight : undefined,
            width: values.width || values.width === 0 ? values.width : undefined,
            height: values.height || values.height === 0 ? values.height : undefined,
            length: values.length || values.length === 0 ? values.length : undefined,
            sku: values.sku?.trim() || undefined,
            id_provider: 'test'
        }

        if (productValues) {
            editProductMutation.mutate(
                { id: productValues.id ?? "", input: payload },
                {
                    onSuccess: () => {
                        toast.success("Product updated successfully")
                        router.push("/admin/products/list")
                    },
                    onError: () => {
                        toast.error("Failed to update product")
                    },
                }
            )
        } else {
            addProductMutation.mutate(
                payload,
                {
                    onSuccess: () => {
                        toast.success("Product add successfully")
                        form.reset()
                    },
                    onError: (error) => {
                        toast.error(<div className='flex flex-col gap-2'>
                            <div>Failed to add product</div>
                            <div>Please check duplication for SKU or EAN</div>
                        </div>)
                        console.log(error)
                    },
                }
            )
        }
    }

    return (
        <div className='pb-20 px-30'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(
                    (values) => {
                        console.log("✅ Valid submit", values)
                        handleSubmit(values)
                    },
                    (errors) => {
                        toast.error("Please check the form for errors")
                        console.log(errors)
                    }
                )}>
                    <div className='grid-cols-12 grid gap-24 w-full'>
                        <div className='col-span-9 flex flex-col gap-4'>
                            {defaultValues ? <h3 className='text-xl text-[#666666]'>Add New Product</h3>
                                : ''}
                            {/*Product Name */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabelWithAsterisk required className='text-[#666666] text-sm'>
                                            Product Name
                                        </FormLabelWithAsterisk>
                                        <FormControl>
                                            <Input placeholder="" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className='flex gap-4 w-full'>
                                {/*Product Cost */}
                                <div className='w-full'>
                                    <FormField
                                        control={form.control}
                                        name="cost"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabelWithAsterisk required className='text-[#666666] text-sm'>
                                                    Cost
                                                </FormLabelWithAsterisk>
                                                <FormControl>
                                                    <div className="relative flex items-center">
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            min={0}
                                                            className="pl-7 w-1/2"
                                                            step="0.01"            // hoặc "any" để cho phép mọi số thập phân
                                                            inputMode="decimal"    // hint cho bàn phím mobile
                                                            value={field.value ?? ""} // tránh uncontrolled / NaN
                                                            onChange={(e) => {
                                                                const v = e.target.value;
                                                                field.onChange(v === "" ? undefined : parseFloat(v));
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

                            <ProductPricingFields form={form} />

                            <FormField
                                control={form.control}
                                name='tax'
                                render={({ field }) => (
                                    <div className='flex gap-4'>
                                        <FormLabelWithAsterisk required className='text-[#666666] text-sm'>
                                            Tax
                                        </FormLabelWithAsterisk>
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
                        <div className='col-span-3 flex flex-col items-end gap-4'>
                            {/*Form Button */}
                            <div className='flex gap-2 justify-end'>
                                <Button className='cursor-pointer bg-gray-400 hover:bg-gray-500 text-white' type="button" hasEffect>Discard</Button>
                                <Button className={`cursor-pointer ${defaultValues ? 'bg-secondary' : ''}`} type="submit" hasEffect>
                                    {isPending ? (
                                        <Loader2 className="animate-spin" />
                                    ) : productValues ? (
                                        "Save"
                                    ) : (
                                        "Add"
                                    )}
                                </Button>

                            </div>
                            <div>ID: {id_provider}</div>
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
                                                className='data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-secondary cursor-pointer'
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

                            {/* Stock input */}
                            <FormField
                                control={form.control}
                                name="stock"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-6 w-full">
                                        <FormLabelWithAsterisk required className='text-[#666666] text-sm col-span-2'>
                                            Stock
                                        </FormLabelWithAsterisk>
                                        <FormControl>
                                            <Input
                                                readOnly={isSimple ? false : true}
                                                type="number"
                                                placeholder="0"
                                                min={0}
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                className={`col-span-4 ${isSimple ? '' : 'bg-gray-100 cursor-not-allowed'}`}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* SKU input */}
                            <FormField
                                control={form.control}
                                name='sku'
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-6 w-full">
                                        <FormLabelWithAsterisk required className='text-[#666666] text-sm col-span-2'>
                                            SKU
                                        </FormLabelWithAsterisk>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="SKU"
                                                className='col-span-4'
                                                value={field.value ?? ""} // null -> ""
                                                onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* EAN input */}
                            <FormField
                                control={form.control}
                                name='ean'
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-6 w-full">
                                        <FormLabelWithAsterisk required className='text-[#666666] text-sm col-span-2'>
                                            EAN
                                        </FormLabelWithAsterisk>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Barcode"
                                                className='col-span-4'
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* Weight input */}
                            <FormField
                                control={form.control}
                                name="weight"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-6 w-full">
                                        <FormLabelWithAsterisk required className="text-[#666666] text-sm col-span-2">
                                            Weight (kg)
                                        </FormLabelWithAsterisk>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Weight"
                                                min={0}
                                                value={field.value ?? ""} // null hoặc undefined => ""
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value === "" ? null : e.target.valueAsNumber
                                                    )
                                                }
                                                className="col-span-4"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />


                            {/* Packaging input */}
                            <div className='grid grid-cols-6 w-full'>
                                <div className='col-span-2'>Packaging (cm)</div>
                                <div className='flex flex-row gap-1 col-span-4'>
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
                                                        {...field}
                                                        value={field.value ?? ""} // null hoặc undefined => ""
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target.value === "" ? null : e.target.valueAsNumber
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <FormLabelWithAsterisk required className='text-[#666666] text-sm'>
                                                    Length
                                                </FormLabelWithAsterisk>
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
                                                        {...field}
                                                        value={field.value ?? ""} // null hoặc undefined => ""
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target.value === "" ? null : e.target.valueAsNumber
                                                            )
                                                        } />
                                                </FormControl>
                                                <FormLabelWithAsterisk required className='text-[#666666] text-sm'>
                                                    Height
                                                </FormLabelWithAsterisk>
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
                                                        {...field}
                                                        value={field.value ?? ""} // null hoặc undefined => ""
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target.value === "" ? null : e.target.valueAsNumber
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <FormLabelWithAsterisk required className='text-[#666666] text-sm'>
                                                    Width
                                                </FormLabelWithAsterisk>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/*Tag choose */}
                            <div className="w-1/2">
                                <FormField
                                    control={form.control}
                                    name="tag"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-base">Tag</FormLabel>
                                            <div className="flex flex-row gap-2 flex-wrap justify-end">
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
                    </div>
                </form>
            </Form>
        </div>

    )
}

export default ProductForm