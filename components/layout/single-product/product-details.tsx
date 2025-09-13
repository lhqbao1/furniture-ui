'use client'
import CustomBreadCrumb from '@/components/shared/breadcrumb'
import ProductVoucher from '@/components/shared/product-voucher'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Eye, Facebook, Heart, Instagram, Plus, Twitter, Youtube } from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import { ProductDetailsTab } from '@/components/layout/single-product/product-tab'
import ListStars from '@/components/shared/list-stars'
import ProductDetailsSkeleton from '@/components/layout/single-product/product-detail-skeleton'
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { cartFormSchema } from '@/lib/schema/cart'
import z from 'zod'
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { toast } from 'sonner'
import ListVariant from '@/components/layout/single-product/list-variant'
import { FormNumberInput } from '@/components/layout/single-product/form-number.input'
import { useAddToCart, useQuickAddToCart } from '@/features/cart/hook'
import { useQuery } from '@tanstack/react-query'
import { getProductGroupDetail } from '@/features/product-group/api'
import { getProductById } from '@/features/products/api'
import { VariantOptionResponse } from '@/types/variant'
import { ProductItem } from '@/types/products'
import { useAddToWishList } from '@/features/wishlist/hook'
import { Voucher } from '@/types/voucher'
import { useTranslations } from 'next-intl'
import { HandleApiError } from '@/lib/api-helper'
import { cn } from '@/lib/utils'

const ProductDetails = () => {
    const params = useParams()
    const router = useRouter()
    const slugArray = Array.isArray(params.slug) ? params.slug : [params.slug]
    const slug = slugArray[slugArray.length - 1]
    const [mainImageIndex, setMainImageIndex] = useState(0)
    const t = useTranslations()

    const vouchers: Voucher[] = [
        {
            id: 1,
            title: t('voucher200'),
            type: t('discount'),
            discountAmount: 10,
            code: 'MO200200'
        },
        {
            id: 2,
            title: t('voucher300'),
            type: t('discount'),
            discountAmount: 15,
            code: 'MO300300'
        },
    ];


    // Form init
    const form = useForm<z.infer<typeof cartFormSchema>>({
        resolver: zodResolver(cartFormSchema),
        defaultValues: {
            productId: "",
            option_id: [],
            quantity: 1,
            is_active: false
        },
    })

    // Watch option_id để biết user chọn options nào
    const optionIds = useWatch({
        control: form.control,
        name: "option_id",
    })

    // Query product theo slug ban đầu
    const { data: initialProduct } = useQuery({
        queryKey: ["product-initial", slug],
        queryFn: () => getProductById(slug as string),
        enabled: !!slug,
        retry: false,
    })

    // Query parent group
    const { data: parentProduct } = useQuery({
        queryKey: ["product-group-detail", initialProduct?.parent_id],
        queryFn: () => getProductGroupDetail(initialProduct!.parent_id ?? ''),
        enabled: !!initialProduct?.parent_id,
        retry: false,
    })

    // Tìm product match dựa vào option_id user chọn
    const matchedProductId = useMemo(() => {
        if (!parentProduct?.products || !optionIds || optionIds.length === 0) return null

        return (
            parentProduct.products.find((p: ProductItem) => {
                const productOptionIds = p.options.map((o: VariantOptionResponse) => o.id)
                return (
                    optionIds.length === productOptionIds.length &&
                    optionIds.every((id: string) => productOptionIds.includes(id))
                )
            })?.id ?? null
        )
    }, [parentProduct?.products, optionIds])

    // Query product details (dùng matchedProductId nếu có, fallback slug ban đầu)
    const { data: productDetails, isLoading: isLoadingProduct, isError: isErrorProduct } = useQuery({
        queryKey: ["product", matchedProductId || slug],
        queryFn: () => getProductById(matchedProductId || (slug as string)),
        enabled: !!(matchedProductId || slug),
        retry: false,
    })

    // Khi có productDetails mới → sync form
    useEffect(() => {
        if (productDetails?.id) {
            form.setValue("productId", productDetails.id)
            form.setValue(
                "option_id",
                productDetails.options.map((o: VariantOptionResponse) => o.id) // auto select option mặc định
            )
        }
    }, [productDetails, form])

    // Add to cart mutation
    const createCartMutation = useAddToCart()

    //Add to wishlist mutation
    const addProductToWishlistMutation = useAddToWishList()

    //Add to wishlist mutation
    const addProductToCheckOutMutation = useQuickAddToCart()

    const handleAddProductToWishlist = () => {
        addProductToWishlistMutation.mutate({ productId: productDetails?.id ?? '', quantity: 1 }, {
            onSuccess: () => {
                toast.success(t('addToWishlistSuccess'))
            },
            onError: (error) => {
                const { status, message } = HandleApiError(error, t);
                toast.error(message)
            },
        })
    }

    const handleAddProductToCart = () => {
        createCartMutation.mutate({ productId: productDetails?.id ?? '', quantity: 1 }, {
            onSuccess: () => {
                toast.success(t('addToCartSuccess'))
            },
            onError: (error) => {
                const { status, message } = HandleApiError(error, t);
                toast.error(message)
            },
        })
    }

    const handleSubmit = (values: z.infer<typeof cartFormSchema>) => {
        createCartMutation.mutate({ productId: productDetails?.id ?? '', quantity: 1 }, {
            onSuccess: () => {
                toast.success(t('addToCartSuccess'))
            },
            onError: (error) => {
                const { status, message } = HandleApiError(error, t);
                toast.error(<div className='flex flex-col'>
                    <div>{message}</div>
                    <div className=''>Login now</div>
                </div>)
            },
        })
        // addProductToCheckOutMutation.mutate({ productId: productDetails?.id ?? '', quantity: 1 }, {
        //     onSuccess: () => {
        //         toast.success(t('addToCheckoutSuccess'))
        //         router.push('/check-out')
        //     },
        //     onError: (error) => {
        //         const { status, message } = HandleApiError(error, t);
        //         toast.error(message)
        //     },
        // })
    }

    // Image zoom
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isHover, setIsHover] = useState(false)
    const handleZoomImage = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
        const x = ((e.pageX - left) / width) * 100
        const y = ((e.pageY - top) / height) * 100
        setPosition({ x, y })
    }

    const [selectedVoucher, setSelectedVoucher] = useState<number>()
    const handleSelectVoucher = (item: number) => setSelectedVoucher(item)
    const adminId = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null;

    const moveToAdmin = (productId: string) => {
        if (adminId) {
            router.push(`/admin/products/${productId}/edit`)
        }
    }

    return (
        <div className='py-3 lg:pt-6'>
            <CustomBreadCrumb isProductPage />
            {!isLoadingProduct && productDetails && !isErrorProduct ?
                <FormProvider {...form}>
                    <form
                        onSubmit={form.handleSubmit(
                            (values) => handleSubmit(values),
                            (e) => console.error("Please check the form for errors", e)
                        )}
                        className='space-y-8 lg:px-30'
                    >
                        <div className='flex flex-col gap-8'>

                            {/*Product details */}
                            <div className='grid grid-cols-12 xl:gap-16 gap-8'>
                                {/*Product details images */}
                                <div className='xl:col-span-6 col-span-12 flex flex-col gap-6 h-fit'>
                                    {/* Main image */}
                                    <div
                                        className='flex justify-center overflow-hidden main-image'
                                        onMouseMove={handleZoomImage}
                                        onMouseEnter={() => setIsHover(true)}
                                        onMouseLeave={() => setIsHover(false)}
                                    >
                                        <Image
                                            src={productDetails.static_files.length > 0 ? productDetails.static_files[mainImageIndex].url : '/2.png'}
                                            width={500}
                                            height={300}
                                            alt={`${productDetails.name}`}
                                            className='transition-transform duration-300 lg:h-[400px] object-cover'
                                            style={{
                                                transformOrigin: `${position.x}% ${position.y}%`,
                                                transform: isHover ? "scale(1.5)" : "scale(1)",
                                            }}
                                        />
                                    </div>
                                    {/* Sub images */}
                                    <div className='flex flex-row px-12 w-full'>
                                        <Carousel opts={{ loop: true }}>
                                            <CarouselContent className='w-full'>
                                                {productDetails.static_files.map((item, index) => (
                                                    <CarouselItem key={index} className={`flex justify-center basis-1/4`}>
                                                        <div
                                                            className="cursor-pointer"
                                                            onClick={() => setMainImageIndex(index)}
                                                        >
                                                            <Image
                                                                src={item.url}
                                                                width={100}
                                                                height={100}
                                                                alt=''
                                                                className={` ${mainImageIndex === index && 'border-2 border-primary p-2 rounded-md object-cover'} lg:h-[80px] object-fill`}
                                                                unoptimized
                                                            />
                                                        </div>
                                                    </CarouselItem>
                                                ))}
                                            </CarouselContent>
                                            <CarouselPrevious className='text-primary border-primary' />
                                            <CarouselNext className='text-primary border-primary' />
                                        </Carousel>
                                    </div>
                                </div>

                                {/*Product details */}
                                <div className='xl:col-span-6 col-span-12 flex flex-col gap-6'>
                                    {adminId ?
                                        <div className='cursor-pointer text-primary' onClick={() => moveToAdmin(productDetails.id)}>
                                            <Eye />
                                        </div>
                                        : ''}
                                    <h2 className='lg:text-3xl text-xl font-semibold text-black/70'>{productDetails.name}</h2>
                                    <div className='flex flex-row justify-start gap-4 items-center'>
                                        {/* <div className='rounded-xl text-xs py-1 uppercase px-2 text-white' style={{ backgroundColor: `red` }}>
                                            {productDetails.tag}
                                        </div> */}

                                        <div className='flex gap-1 items-center'>
                                            <p className='text-xl text-gray-500 font-bold'>5</p>
                                            <ListStars rating={5} />
                                        </div>
                                    </div>
                                    <div className='flex gap-2'>
                                        <p className='text-primary lg:text-3xl text-xl font-semibold'>€{productDetails.final_price.toFixed(2)}</p>
                                        <p className='text-gray-300 line-through lg:text-3xl text-xl font-semibold'>€{productDetails.price.toFixed(2)}</p>
                                    </div>

                                    <div className='space-y-2'>
                                        <div>{t('includeVatAndShipping')}</div>
                                        {productDetails.stock > 0 ?
                                            <div
                                                className={cn(`border py-1.5 px-2.5 rounded-md w-fit`,
                                                    productDetails.stock <= 10 && 'text-red-500 border-red-500',
                                                    productDetails.stock > 10 && productDetails.stock < 30 ? 'text-primary border-primary' : '',
                                                    productDetails.stock > 30 && 'text-secondary border-secondary'
                                                )}
                                            >
                                                {t('inStock')}: {productDetails.stock}
                                            </div>
                                            : <div>{t('outStock')}</div>}
                                    </div>

                                    {parentProduct && parentProduct?.variants?.length > 0 &&
                                        <ListVariant
                                            variant={parentProduct.variants}
                                            currentProduct={productDetails}
                                            parentProduct={parentProduct}
                                        />
                                    }


                                    {/* <div className='grid grid-cols-2 gap-2'>
                                        <div className='flex flex-row gap-1 items-center'>
                                            <Image
                                                src={'/1.svg'}
                                                width={36}
                                                height={36}
                                                alt='1'
                                                style={{ width: 40 }}
                                            />
                                            <p className='text-base'>Lorem ipsum</p>
                                        </div>
                                        <div className='flex flex-row gap-1 items-center'>
                                            <Image
                                                src={'/2.svg'}
                                                width={36}
                                                height={36}
                                                alt='1'
                                                style={{ width: 40 }}

                                            />
                                            <p className='text-base'>Lorem ipsum</p>
                                        </div>
                                        <div className='flex flex-row gap-1 items-center'>
                                            <Image
                                                src={'/3.svg'}
                                                width={36}
                                                // sizes={16}
                                                height={36}
                                                alt='1'
                                                style={{ width: 40 }}
                                            />
                                            <p className='text-base'>Lorem ipsum</p>
                                        </div>
                                        <div className='flex flex-row gap-1 items-center'>
                                            <Image
                                                src={'/4.svg'}
                                                width={36}
                                                height={36}
                                                alt='1'
                                                style={{ width: 40 }}

                                            />
                                            <p className='text-base'>Lorem ipsum</p>
                                        </div>
                                    </div> */}

                                    <div className='flex flex-row gap-6 items-end'>
                                        <div className='lg:basis-1/3 basis-2/5'>
                                            <FormField
                                                control={form.control}
                                                name="quantity"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t('quantity')}</FormLabel>
                                                        <FormControl>
                                                            <FormNumberInput {...field} min={1} stepper={1} placeholder="1" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <Button
                                            className="rounded-xl px-10 font-bold text-lg lg:basis-2/5 basis-3/5 relative lg:min-h-[40px]"
                                            type="submit"
                                        >
                                            {t('addToCart')}
                                            <div
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    handleAddProductToWishlist()
                                                }}
                                                className="absolute bg-white rounded-xl aspect-square h-full text-gray-500 font-bold flex items-center justify-center border border-primary right-0"
                                            >
                                                <Heart />
                                            </div>
                                            <div
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    handleAddProductToCart()
                                                }}
                                                className="absolute bg-white rounded-xl aspect-square h-full text-gray-500 font-bold flex items-center justify-center border border-primary left-0"
                                            >
                                                <Plus />
                                            </div>
                                        </Button>

                                    </div>

                                    {/* Voucher */}
                                    {/* <div className='flex lg:flex-row flex-col justify-center gap-2 mt-6'>
                                        {vouchers.map((item, index) => (
                                            <ProductVoucher
                                                item={item}
                                                key={index}
                                                isSelected={selectedVoucher === item.id}
                                                onSelect={() => handleSelectVoucher(item.id)}
                                            />
                                        ))}
                                    </div> */}
                                </div>
                            </div>

                            {/*Product tabs */}
                            <div className='lg:mt-12 mt-8'>
                                <ProductDetailsTab product={productDetails} />
                            </div>
                        </div>
                    </form>
                </FormProvider>
                : <ProductDetailsSkeleton />}
        </div>
    )
}

export default ProductDetails
