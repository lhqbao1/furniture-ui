'use client'
import CustomBreadCrumb from '@/components/shared/breadcrumb'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Eye, Heart, Truck } from 'lucide-react'
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
import { useAddToCart } from '@/features/cart/hook'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getProductById } from '@/features/products/api'
import { VariantOptionResponse } from '@/types/variant'
import { ProductItem } from '@/types/products'
import { useAddToWishList } from '@/features/wishlist/hook'
import { useTranslations } from 'next-intl'
import { HandleApiError } from '@/lib/api-helper'
import { cn } from '@/lib/utils'
import { useCartLocal } from '@/hooks/cart'
import { useSwipeable } from "react-swipeable"
import { ProductGroupDetailResponse } from '@/types/product-group'
import { getProductGroupDetail } from '@/features/product-group/api'
import ProductImageDialog from './main-image-dialog'
import { CartItemLocal } from '@/lib/utils/cart'
import { CartItem } from '@/types/cart'

interface ProductDetailsProps {
    productDetailsData: ProductItem
    productId: string
    parentProductData: ProductGroupDetailResponse | null
}

const ProductDetails = ({ productDetailsData, productId, parentProductData }: ProductDetailsProps) => {
    const [mainImageIndex, setMainImageIndex] = useState(0)
    const t = useTranslations()
    const { addToCartLocal, cart } = useCartLocal()
    const router = useRouter()
    const queryClient = useQueryClient()

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

    const { data: productDetails, isLoading: isLoadingProduct } = useQuery({
        queryKey: ["product", productId],
        queryFn: () => getProductById(productId),
        initialData: productDetailsData
    })

    const { data: parentProduct, isLoading: isLoadingParent } = useQuery({
        queryKey: ["product-group-detail", productDetailsData.parent_id],
        queryFn: () => getProductGroupDetail(productDetailsData.parent_id ?? ''),
        enabled: !!productDetailsData.parent_id,
        initialData: parentProductData
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


    const handleSubmit = (values: z.infer<typeof cartFormSchema>) => {
        if (!productDetails) return
        const userId = localStorage.getItem("userId");

        if (!userId) {
            const existingItem = cart.find((item: CartItemLocal) => item.product_id === productDetails.id)
            const totalQuantity = (existingItem?.quantity || 0) + values.quantity

            if (totalQuantity > productDetails.stock) {
                toast.error(
                    t('notEnoughStock')
                )
                return
            }
            addToCartLocal({
                item: {
                    product_id: productDetails.id ?? '',
                    quantity: values.quantity, is_active: true,
                    item_price: productDetails.final_price,
                    final_price: productDetails.final_price,
                    img_url: productDetails.static_files[0].url,
                    product_name: productDetails.name,
                    stock: productDetails.stock,
                    carrier: productDetails.carrier ? productDetails.carrier : 'amm'
                }
            }, {
                onSuccess(data, variables, context) {
                    toast.success(t('addToCartSuccess'))
                },
                onError(error, variables, context) {
                    toast.error(t('addToCartFail'))
                },
            })
        } else {
            // const serverCart: CartItem[] = queryClient.getQueryData(["cart-items"]) || []
            // console.log(serverCart)
            // const existingItem = serverCart.find((item) => item.products.id === productDetails.id)
            // const totalQuantity = (existingItem?.quantity || 0) + values.quantity

            // if (totalQuantity > productDetails.stock) {
            // toast.error(
            //     t('notEnoughStock')
            // )
            //     return
            // }

            createCartMutation.mutate({ productId: productDetails?.id ?? '', quantity: values.quantity }, {
                onSuccess(data, variables, context) {
                    toast.success(t('addToCartSuccess'))
                },
                onError(error, variables, context) {
                    const { status, message } = HandleApiError(error, t);
                    if (status === 400) {
                        toast.error(
                            t('notEnoughStock')
                        )
                        return
                    }
                    toast.error(message)
                    if (status === 401) router.push('/login')
                },
            })
        }
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

    const adminId = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null;

    const moveToAdmin = (productId: string) => {
        if (adminId) {
            router.push(`/admin/products/${productId}/edit`)
        }
    }

    const handlers = useSwipeable({
        onSwipedLeft: () => {
            if (!productDetails?.static_files?.length) return
            setMainImageIndex((prev) => (prev + 1) % productDetails.static_files.length)
        },
        onSwipedRight: () => {
            if (!productDetails?.static_files?.length) return
            setMainImageIndex((prev) =>
                prev === 0 ? productDetails.static_files.length - 1 : prev - 1
            )
        },
        trackTouch: true,
    })

    return (
        <div className='py-3 lg:pt-3 space-y-4'>
            <CustomBreadCrumb
                isProductPage
                currentPage={
                    productDetails?.categories[0]?.children?.length
                        ? productDetails.categories[0].children[0].name
                        : productDetails?.categories[0]?.name
                }
            />
            {!isLoadingProduct && productDetails ?
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
                                    <ProductImageDialog productDetails={productDetails}>
                                        <div
                                            className='flex justify-center overflow-hidden main-image'
                                            onMouseMove={handleZoomImage}
                                            onMouseEnter={() => setIsHover(true)}
                                            onMouseLeave={() => setIsHover(false)}
                                            {...handlers}
                                        >
                                            <Image
                                                src={productDetails.static_files.length > 0 ? productDetails.static_files[mainImageIndex].url : '/2.png'}
                                                width={500}
                                                height={300}
                                                alt={`${productDetails.name}`}
                                                className='transition-transform duration-300 lg:h-[400px] h-[300px] w-auto object-cover cursor-pointer'
                                                style={{
                                                    transformOrigin: `${position.x}% ${position.y}%`,
                                                    transform: isHover ? "scale(1.5)" : "scale(1)",
                                                }}
                                                priority
                                            />
                                        </div>
                                    </ProductImageDialog>

                                    {/* Sub images */}
                                    <div className='flex flex-row px-12 w-full'>
                                        <Carousel opts={{ loop: true, align: 'start' }}>
                                            <CarouselContent className='w-full flex'>
                                                {productDetails.static_files.map((item, index) => (
                                                    <CarouselItem key={index} className={`lg:basis-1/4 basis-1/3`}>
                                                        <div
                                                            className="cursor-pointer"
                                                            onClick={() => setMainImageIndex(index)}
                                                        >
                                                            <Image
                                                                src={item.url}
                                                                width={100}
                                                                height={100}
                                                                alt=''
                                                                className={` ${mainImageIndex === index && 'border-2 border-primary lg:p-2 p-0.5 rounded-md object-cover'} lg:h-[80px] h-[60px] w-auto object-fill`}
                                                                priority={index < 2}
                                                                loading={index < 2 ? 'eager' : 'lazy'}
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
                                            <ListStars rating={0} />
                                        </div>
                                    </div>
                                    <div className='flex gap-2'>
                                        <p className='text-primary lg:text-3xl text-xl font-semibold'>{productDetails.final_price ? <>€{productDetails.final_price.toFixed(2)}</> : ''}</p>
                                        <p className='text-gray-300 line-through lg:text-3xl text-xl font-semibold'>{productDetails.price ? <>€{productDetails.price.toFixed(2)}</> : ''}</p>
                                    </div>

                                    <div className='space-y-2'>
                                        <div>{t('includeVatAndShipping')}</div>
                                        {productDetails.stock > 0 ?
                                            <div
                                                className={cn(`border py-1.5 px-2.5 rounded-md w-fit`,
                                                    productDetails.stock <= 10 && 'text-red-500 border-red-500',
                                                    productDetails.stock > 10 && productDetails.stock < 50 ? 'text-primary border-primary' : '',
                                                    productDetails.stock > 50 && 'text-secondary border-secondary'
                                                )}
                                            >
                                                {t('inStock')}: {productDetails.stock}
                                            </div>
                                            : <div>{t('outStock')}</div>}
                                        <div className='flex flex-row gap-4 items-start border px-2.5 py-1.5 rounded-md w-fit border-black/40'>
                                            <Truck size={30} />
                                            <div>
                                                <p className='font-bold'>{t('delivery')}</p>
                                                <p className='font-light'>{productDetails.delivery_time ? t('deliveryTime', { days: productDetails.delivery_time }) : t('updating')}</p>
                                            </div>
                                        </div>
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

                                    <div className='flex lg:flex-row flex-col items-start gap-6 lg:items-end'>
                                        <div className='lg:basis-1/3 basis-2/5'>
                                            <FormField
                                                control={form.control}
                                                name="quantity"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t('quantity')}</FormLabel>
                                                        <FormControl>
                                                            <FormNumberInput {...field} min={1} max={productDetails.stock} stepper={1} placeholder="1" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <Button
                                            className="rounded-md pr-10 font-bold text-start justify-start lg:text-lg text-base lg:basis-2/5 w-3/5 relative lg:min-h-[40px] lg:h-fit !h-[40px]"
                                            type="submit"
                                        >
                                            {t('addToCart')}
                                            <div
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    handleAddProductToWishlist()
                                                }}
                                                className="absolute bg-white rounded-md aspect-square h-full text-gray-500 font-bold flex items-center justify-center border border-primary right-0"
                                            >
                                                <Heart />
                                            </div>
                                            {/* <div
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    handleAddProductToCart()
                                                }}
                                                className="absolute bg-white rounded-md aspect-square h-full text-gray-500 font-bold flex items-center justify-center border border-primary left-0"
                                            >
                                                <Plus />
                                            </div> */}
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
