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
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { ProductItem, StaticFile } from '@/types/products'
import { toast } from 'sonner'
import { ProductPricingFields } from './pricing-field'
import { MultiSelectField } from './category-select'
import { CategoryResponse } from '@/types/categories'
import { FormLabelWithAsterisk } from '@/components/shared/form-label-with-asterisk'
import { useAddProduct, useEditProduct } from '@/features/products/hook'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGetBrands } from '@/features/brand/hook'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import countries from "world-countries"
import GpsrInput from './form-input/gpsr'

interface AddProductFormProps {
    productValues?: Partial<ProductItem>
    onSubmit: (values: ProductInput) => Promise<void> | void
    isPending?: boolean
}

const ProductForm = ({ productValues, onSubmit, isPending }: AddProductFormProps) => {
    const [description, setDescription] = useState("")
    const [isSimple, setIsSimple] = useState(true)
    const router = useRouter()
    const editProductMutation = useEditProduct()
    const addProductMutation = useAddProduct()


    const carriers = [
        { id: "amm", logo: "/amm.jpeg" },
        { id: "dpd", logo: "/dpd.jpeg" },
    ]

    const deliveryTimes = ["1-3", "3-5", "5-8", "5-14", "8-14", "14-20"]

    const countryOptions = countries.map((c) => ({
        value: c.name.common,
        label: c.name.common,
    }))

    const normalizeProductValues = (productValues?: Partial<ProductItem>) => {
        if (!productValues) return defaultValues

        return {
            ...defaultValues,
            ...productValues,
            category_ids:
                productValues.categories?.map((c: CategoryResponse | number) =>
                    typeof c === "object" ? String(c.id) : String(c)
                ) || [],
            brand_id: productValues.brand?.id
        }
    }

    const form = useForm<z.infer<typeof addProductSchema>>({
        resolver: zodResolver(addProductSchema),
        defaultValues: normalizeProductValues(productValues) || defaultValues,
        mode: "onBlur",
    })


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
            final_price: values.final_price ? values.final_price : values.price
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
                            {!defaultValues ? <h3 className='text-xl text-[#666666]'>Add New Product</h3>
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

                            <div className='grid grid-cols-2 gap-4 justify-end items-end'>
                                {/*Product Cost */}
                                <div className='w-full col-span-1'>
                                    <FormField
                                        control={form.control}
                                        name="cost"
                                        render={({ field }) => (
                                            <FormItem className='grid-cols-1 grid'>
                                                <FormLabelWithAsterisk required className='text-[#666666] text-sm'>
                                                    Cost
                                                </FormLabelWithAsterisk>
                                                <FormControl>
                                                    <div className="relative flex items-center w-full">
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            min={0}
                                                            className="pl-7"
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
                                                <FormMessage className='col-span-2' />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <ProductPricingFields form={form} />
                            </div>


                            <FormField
                                control={form.control}
                                name='tax'
                                render={({ field }) => (
                                    <div className='flex gap-4 flex-col'>
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
                                    {addProductMutation.isPending || editProductMutation.isPending ? (
                                        <Loader2 className="animate-spin" />
                                    ) : productValues ? (
                                        "Save"
                                    ) : (
                                        "Add"
                                    )}
                                </Button>

                            </div>
                            <div>ID: {productValues?.id_provider}</div>
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
                                                readOnly={!isSimple}
                                                type="number"
                                                min={0}
                                                value={field.value ?? ""}
                                                onChange={(e) =>
                                                    field.onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)
                                                }
                                                className={cn(
                                                    "col-span-4",
                                                    isSimple ? "" : "bg-gray-100 cursor-not-allowed"
                                                )}
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
                                <div className='col-span-2 text-sm text-[#666666]'>Packaging (cm)</div>
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

                            {/* WEEE Nr */}
                            <FormField
                                control={form.control}
                                name="weee_nr"
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 w-full'>
                                        <FormLabel className="text-[#666666] text-sm col-span-2">
                                            WEEE Nr
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="" {...field} className='col-span-4' />
                                        </FormControl>
                                        <FormMessage className='col-span-6' />
                                    </FormItem>
                                )}
                            />

                            {/* EEK Label: */}
                            <FormField
                                control={form.control}
                                name="weee_nr"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-6 w-full">
                                        <FormLabel className="text-[#666666] text-sm col-span-2">
                                            EEK Label
                                        </FormLabel>
                                        <FormControl >
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                            {/* Carrier field */}
                            <FormField
                                control={form.control}
                                name="carrier"
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 w-full'>
                                        <FormLabelWithAsterisk required className="text-[#666666] text-sm col-span-2">
                                            Carrier
                                        </FormLabelWithAsterisk>
                                        <FormControl>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger placeholderColor className='border col-span-4 font-light'>
                                                    <SelectValue placeholder="Select carrier" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {carriers.map((c) => (
                                                        <SelectItem key={c.id} value={c.id}>
                                                            <div className="flex items-center gap-2">
                                                                <Image
                                                                    src={c.logo}
                                                                    alt={c.id}
                                                                    width={30}
                                                                    height={20}
                                                                    className="object-contain"
                                                                />
                                                                <span className="uppercase">{c.id}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Delivery time field */}
                            <FormField
                                control={form.control}
                                name="delivery_time"
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 w-full'>
                                        <FormLabelWithAsterisk required className="text-[#666666] text-sm col-span-2">
                                            Delivery time
                                        </FormLabelWithAsterisk>
                                        <FormControl>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger placeholderColor className='border col-span-4 font-light'>
                                                    <SelectValue placeholder="Select delivery time" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {deliveryTimes.map((t) => (
                                                        <SelectItem key={t} value={t}>
                                                            {t}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Manufacture Country */}
                            <FormField
                                control={form.control}
                                name="manufacture_country"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-6 w-full">
                                        <FormLabel className="text-[#666666] text-sm col-span-2">
                                            Manufacture Country
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


                            {/* Tariff Number */}
                            <FormField
                                control={form.control}
                                name="tariff_number"
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 w-full'>
                                        <FormLabelWithAsterisk required className="text-[#666666] text-sm col-span-2">
                                            Tariff Number
                                        </FormLabelWithAsterisk>
                                        <FormControl>
                                            <Input placeholder="Enter tariff number" {...field} className='col-span-4' />
                                        </FormControl>
                                        <FormMessage className='col-span-6' />
                                    </FormItem>
                                )}
                            />

                            {/* Brand */}
                            <GpsrInput />

                            {/*Tag choose */}
                            <div className="w-full">
                                <FormField
                                    control={form.control}
                                    name="tag"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-base justify-end">Tag</FormLabel>
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