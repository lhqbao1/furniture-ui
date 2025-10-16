'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { Button } from "@/components/ui/button"
import {
    Form,
} from "@/components/ui/form"
import "react-quill-new/dist/quill.snow.css"
import { Eye, Loader2 } from 'lucide-react'
import { ProductItem, StaticFile } from '@/types/products'
import { toast } from 'sonner'
import { CategoryResponse } from '@/types/categories'
import { useAddProduct, useEditProduct } from '@/features/products/hook'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from '@/src/i18n/navigation'
import { useLocale } from 'next-intl'
import ProductDetailInputs from '@/components/layout/admin/products/products-form/fisrt-group'
import ProductAdditionalInputs from '@/components/layout/admin/products/products-form/product-additional-group'
import ProductLogisticsGroup from '@/components/layout/admin/products/products-form/product-logistics-group'
import ProductSEOGroup from '@/components/layout/admin/products/products-form/product-seo-group'
import { useAddProductDSP } from '@/features/dsp/products/hook'
import { addProductDSPSchema, defaultValuesDSP, ProductInputDSP } from '@/lib/schema/dsp/product'

interface AddProductFormDSPProps {
    productValues?: Partial<ProductItem>
    onSubmit: (values: ProductInputDSP) => Promise<void> | void
    isPending?: boolean
    productValuesClone?: Partial<ProductItem>
}

const ProductFormDSP = ({ productValues, onSubmit, isPending, productValuesClone }: AddProductFormDSPProps) => {
    const router = useRouter()
    const locale = useLocale()
    const editProductMutation = useEditProduct()
    const addProductMutation = useAddProductDSP()
    const [isLoadingSEO, setIsLoadingSEO] = useState(false)

    const normalizeProductValues = (productValues?: Partial<ProductItem>) => {
        if (!productValues) return defaultValuesDSP

        return {
            ...defaultValuesDSP,
            ...productValues,
            category_ids:
                productValues.categories?.map((c: CategoryResponse | number) =>
                    typeof c === "object" ? String(c.id) : String(c)
                ) || [],
            brand_id: productValues.brand?.id,
        }
    }

    const initialValues = normalizeProductValues(productValuesClone || productValues)

    const form = useForm<z.infer<typeof addProductDSPSchema>>({
        resolver: zodResolver(addProductDSPSchema),
        defaultValues: initialValues,
        mode: "onBlur",
    })

    useEffect(() => {
        if (productValuesClone) {
            form.reset(normalizeProductValues(productValuesClone))
        } else if (productValues) {
            form.reset(normalizeProductValues(productValues))
        }
    }, [productValuesClone, productValues, form])

    const handleSubmit = async (values: ProductInputDSP) => {
        const payload = {
            ...values,
            weight: values.weight || values.weight === 0 ? values.weight : undefined,
            delivery_cost: values.delivery_cost || values.delivery_cost === 0 ? values.delivery_cost : undefined,
            width: values.width || values.width === 0 ? values.width : undefined,
            height: values.height || values.height === 0 ? values.height : undefined,
            length: values.length || values.length === 0 ? values.length : undefined,
            final_price: values.final_price ?? values.price ?? undefined,
            price: values.price ?? values.final_price ?? undefined,
            stock: values.stock ?? 1
        }

        if (productValuesClone) {
            // 🟢 Clone thì vẫn gọi add
            addProductMutation.mutate(payload, {
                onSuccess: () => {
                    toast.success("Product add successfully")
                    form.reset()
                    router.push("/dsp/admin/products/list", { locale })
                },
                onError: (error) => {
                    toast.error(
                        <div className="flex flex-col gap-2">
                            <div>Failed to add product</div>
                            <div>Please check duplication for SKU or EAN</div>
                        </div>
                    )
                    console.log(error)
                },
            })
        } else if (productValues) {
            const updatePayload = { ...payload, is_active: false }

            // 🟡 Edit
            editProductMutation.mutate(
                { id: productValues.id ?? "", input: updatePayload },
                {
                    onSuccess: () => {
                        toast.success("Product updated successfully")
                        router.push("/dsp/admin/products/list", { locale })
                        router.refresh()
                    },
                    onError: () => {
                        toast.error("Failed to update product")
                    },
                }
            )
        } else {
            // 🔵 Add mới
            addProductMutation.mutate(payload, {
                onSuccess: () => {
                    toast.success("Product add successfully")
                    form.reset()
                },
                onError: (error) => {
                    toast.error(
                        <div className="flex flex-col gap-2">
                            <div>Failed to add product</div>
                            <div>Please check duplication for SKU or EAN</div>
                        </div>
                    )
                    console.log(error)
                },
            })
        }

    }

    return (
        <div className='pb-20 px-30'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(
                    (values) => {
                        handleSubmit(values)
                    },
                    (errors) => {
                        toast.error("Please check the form for errors")
                        console.log(errors)
                    }
                )}>
                    <div className='grid-cols-12 grid gap-24 w-full'>
                        <div className='col-span-9 flex flex-col gap-4'>
                            {!defaultValuesDSP ? <h3 className='text-xl text-[#666666]'>Add New Product</h3>
                                : ''}

                            <Accordion
                                type="multiple"
                                className="w-full space-y-8"
                                defaultValue={["details"]}
                            >
                                <AccordionItem value="details">
                                    <AccordionTrigger className='bg-gray-100 px-2 rounded-sm text-lg font-bold items-center cursor-pointer'>
                                        <span>Product Details</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="mt-2">
                                        <Card>
                                            <CardContent>
                                                <ProductDetailInputs isEdit={productValues ? true : false} productId={productValues ? productValues.id_provider : null} isDSP />
                                            </CardContent>
                                        </Card>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="additional">
                                    <AccordionTrigger className='bg-gray-100 px-2 rounded-sm text-lg font-bold flex items-center cursor-pointer hover:'>Product Additional Details</AccordionTrigger>
                                    <AccordionContent className="mt-2">
                                        <Card>
                                            <CardContent>
                                                <ProductAdditionalInputs />
                                            </CardContent>
                                        </Card>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="logistic">
                                    <AccordionTrigger className='bg-gray-100 px-2 rounded-sm text-lg font-bold flex items-center cursor-pointer hover:'>Product Logistic</AccordionTrigger>
                                    <AccordionContent className="mt-2">
                                        <Card>
                                            <CardContent>
                                                <ProductLogisticsGroup isDSP />
                                            </CardContent>
                                        </Card>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>

                        <div className='col-span-3 flex flex-col items-end gap-4 relative'>
                            {/*Form Button */}
                            <div className='grid grid-cols-2 gap-2 justify-end top-24 fixed'>
                                <Button className='cursor-pointer bg-gray-400 hover:bg-gray-500 text-white text-lg px-8' type="button" hasEffect>Discard</Button>
                                <Button className={`cursor-pointer text-lg px-8 ${defaultValuesDSP ? 'bg-secondary' : ''}`} type="submit" hasEffect disabled={isLoadingSEO}>
                                    {addProductMutation.isPending || editProductMutation.isPending ? (
                                        <Loader2 className="animate-spin" />
                                    ) : productValues ? (
                                        "Save"
                                    ) : (
                                        "Add"
                                    )}
                                </Button>
                                <Button variant={'outline'} className='cursor-pointer text-black text-lg px-8 basis-1/2' type="button" hasEffect onClick={() => router.back()}
                                >Back</Button>
                            </div>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default ProductFormDSP