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
import { addProductSchema, defaultValues, ProductInput } from '@/lib/schema/product'
import { Loader2 } from 'lucide-react'
import { ProductItem } from '@/types/products'
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
import ProductDetailInputs from './fisrt-group'
import ProductAdditionalInputs from './product-additional-group'
import ProductLogisticsGroup from './product-logistics-group'
import ProductSEOGroup from './product-seo-group'
import { useRouter } from '@/src/i18n/navigation'
import { useLocale } from 'next-intl'
import SelectBundleComponent from '../bundle/select-bundle'
import AdminBackButton from '@/components/shared/admin-back-button'
import { is } from 'date-fns/locale'

interface AddProductFormProps {
    productValues?: Partial<ProductItem>
    onSubmit: (values: ProductInput) => Promise<void> | void
    isPending?: boolean
    productValuesClone?: Partial<ProductItem>
}

const ProductForm = ({ productValues, onSubmit, isPending, productValuesClone }: AddProductFormProps) => {
    const router = useRouter()
    const locale = useLocale()
    const editProductMutation = useEditProduct()
    const addProductMutation = useAddProduct()
    const [isLoadingSEO, setIsLoadingSEO] = useState(false)

    const normalizeProductValues = (productValues?: Partial<ProductItem>) => {
        if (!productValues) return defaultValues

        return {
            ...defaultValues,
            ...productValues,
            category_ids:
                productValues.categories?.map((c: CategoryResponse | number) =>
                    typeof c === "object" ? String(c.id) : String(c)
                ) || [],
            brand_id: productValues.brand?.id,
        }
    }

    const initialValues = normalizeProductValues(productValuesClone || productValues)

    const form = useForm<z.infer<typeof addProductSchema>>({
        resolver: zodResolver(addProductSchema),
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

    const handleSubmit = async (values: ProductInput) => {
        const payload = {
            ...values,
            weight: values.weight || values.weight === 0 ? values.weight : undefined,
            delivery_cost: values.delivery_cost || values.delivery_cost === 0 ? values.delivery_cost : undefined,
            width: values.width || values.width === 0 ? values.width : undefined,
            height: values.height || values.height === 0 ? values.height : undefined,
            length: values.length || values.length === 0 ? values.length : undefined,
            cost: values.cost || values.cost === 0 ? values.cost : undefined,
            final_price: values.final_price ?? values.price ?? undefined,
            price: values.price ?? values.final_price ?? undefined,
            stock: values.stock ?? 1,
            is_bundle: values.bundles && values.bundles?.length > 0 ? true : false,
            tag: values.tag === "" ? undefined : values.tag,
            is_active: productValuesClone ? false : (values.is_active ?? true),
        }

        if (payload.is_econelo) {
            if (!payload.price || !payload.final_price) {
                toast.error("Econelo products need both price and sale price")
                return
            }
        }

        if (productValuesClone) {
            // 🟢 Clone thì vẫn gọi add
            addProductMutation.mutate(payload, {
                onSuccess: () => {
                    toast.success("Product add successfully")
                    form.reset()
                    router.push("/admin/products/list", { locale })
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
            // 🟡 Edit
            editProductMutation.mutate(
                { id: productValues.id ?? "", input: payload },
                {
                    onSuccess: () => {
                        toast.success("Product updated successfully")
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
        <div className='lg:pb-20 lg:px-30 pb-12'>
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
                    <div className='lg:grid-cols-12 lg:grid flex flex-col-reverse lg:gap-24 w-full'>
                        <div className='lg:col-span-9 flex flex-col gap-4'>
                            {!defaultValues ? <h3 className='text-xl text-[#666666]'>Add New Product</h3>
                                : ''}
                            <Accordion
                                type="multiple"
                                className="w-full space-y-8"
                                defaultValue={["details"]}
                            >
                                <AccordionItem value="details">
                                    <AccordionTrigger className='bg-gray-100 px-2 rounded-sm text-lg font-bold flex items-center cursor-pointer hover:'>Details</AccordionTrigger>
                                    <AccordionContent className="mt-2">
                                        <Card>
                                            <CardContent>
                                                <ProductDetailInputs isEdit={productValues ? true : false} productId={productValues ? productValues.id_provider : null} />
                                            </CardContent>
                                        </Card>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="additional">
                                    <AccordionTrigger className='bg-gray-100 px-2 rounded-sm text-lg font-bold flex items-center cursor-pointer hover:'>Additional Details</AccordionTrigger>
                                    <AccordionContent className="mt-2">
                                        <Card>
                                            <CardContent>
                                                <ProductAdditionalInputs />
                                            </CardContent>
                                        </Card>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="component">
                                    <AccordionTrigger className='bg-gray-100 px-2 rounded-sm text-lg font-bold flex items-center cursor-pointer hover:'>Product Bundle</AccordionTrigger>
                                    <AccordionContent className="mt-2">
                                        <Card>
                                            <CardContent>
                                                <SelectBundleComponent currentProduct={productValues} />
                                            </CardContent>
                                        </Card>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="logistic">
                                    <AccordionTrigger className='bg-gray-100 px-2 rounded-sm text-lg font-bold flex items-center cursor-pointer hover:'>Logistic</AccordionTrigger>
                                    <AccordionContent className="mt-2">
                                        <Card>
                                            <CardContent>
                                                <ProductLogisticsGroup />
                                            </CardContent>
                                        </Card>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="seo">
                                    <AccordionTrigger className='bg-gray-100 px-2 rounded-sm text-lg font-bold flex items-center cursor-pointer hover:'>SEO</AccordionTrigger>
                                    <AccordionContent className="mt-2">
                                        <Card>
                                            <CardContent>
                                                <ProductSEOGroup setIsLoadingSEO={setIsLoadingSEO} />
                                            </CardContent>
                                        </Card>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>

                        <div className='lg:col-span-3  flex flex-col items-end gap-4 relative'>
                            {/*Form Button */}
                            <div className='grid grid-cols-2 gap-2 justify-end top-24 fixed'>
                                <Button className={`cursor-pointer text-lg px-8 ${defaultValues ? 'bg-secondary' : ''}`} type="submit" hasEffect disabled={isLoadingSEO}>
                                    {addProductMutation.isPending || editProductMutation.isPending ? (
                                        <Loader2 className="animate-spin" />
                                    ) : productValues ? (
                                        "Save"
                                    ) : (
                                        "Add"
                                    )}
                                </Button>
                                <AdminBackButton />
                                {productValues && (
                                    <a
                                        href={`/${locale}/product${productValues?.categories?.length ? `/${productValues.categories[0].slug}` : ''}/${productValues?.url_key}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button
                                            variant="outline"
                                            className="cursor-pointer text-black text-lg px-8"
                                            type="button"
                                            hasEffect
                                        >
                                            View
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default ProductForm