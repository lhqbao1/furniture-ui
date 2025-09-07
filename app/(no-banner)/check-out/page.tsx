'use client'

import AddressSelector from '@/components/layout/checkout/shipping'
import Image from 'next/image'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { z } from "zod"
import PaymentMethodSelector from '@/components/layout/checkout/method'
import { cartItems, vouchers } from '@/data/data'
import ProductVoucher from '@/components/shared/product-voucher'
import { Textarea } from '@/components/ui/textarea'
import { useGetAddressByUserId, useGetInvoiceAddressByUserId } from '@/features/address/hook'
import { CreateOrderFormValues, CreateOrderSchema } from '@/lib/schema/checkout'
import { toast } from 'sonner'
import { useGetCartItems } from '@/features/cart/hook'
import CartTable from '@/components/layout/cart/cart-table'
import { useCreateCheckOut } from '@/features/checkout/hook'
import { useCreatePayment } from '@/features/payment/hook'
import { useAtom } from 'jotai'
import { checkOutIdAtom, paymentIdAtom } from '@/store/payment'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export interface CartItem {
    id: number
    name: string
    color: string
    size: string
    unitPrice: number
    quantity: number
    imageUrl: string
}

const checkOutBreadcrumb = [
    { label: 'Wishlist', icon: 'wishlist.svg' },
    { label: 'Cart', icon: 'cart.svg' },
    { label: 'Checkout', icon: 'checkout.svg' },
    { label: 'Tracking', icon: 'tracking.svg' },
]


export default function CheckOutPage() {
    const [userId, setUserId] = useState<string>("")
    const [paymentId, setPaymentId] = useAtom(paymentIdAtom)
    const [checkout, setCheckOut] = useAtom(checkOutIdAtom)
    const router = useRouter()
    const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({})


    // SSR-safe: chỉ đọc localStorage sau khi client mounted
    useEffect(() => {
        const storedId = localStorage.getItem("userId")
        if (storedId) setUserId(storedId)
    }, [])

    const [selectedVoucher, setSelectedVoucher] = useState<number>()
    const { data: addresses } = useGetAddressByUserId(userId)
    const { data: cartItems, isLoading: isLoadingCart } = useGetCartItems()
    const { data: invoiceAddress } = useGetInvoiceAddressByUserId(userId)
    const createCheckOutMutation = useCreateCheckOut()
    const createPaymentMutation = useCreatePayment()


    const handleSelectVoucher = useCallback((item: number) => {
        setSelectedVoucher(item)
    }, [])

    const form = useForm<CreateOrderFormValues>({
        resolver: zodResolver(CreateOrderSchema),
        defaultValues: {
            shipping_address_id: "",
            invoice_address_id: "",
            cart_id: '',
            note: '',
            coupon_amount: 0,
            voucher_amount: 0,
            total_shipping: 0
        },
    })

    //Assign cart_id into form values
    useEffect(() => {
        if (cartItems?.id) {
            form.setValue("cart_id", cartItems.id)
        }
        if (invoiceAddress?.id) {
            form.setValue("invoice_address_id", invoiceAddress.id)
        }
    }, [cartItems, invoiceAddress, form])


    const handleSubmit = useCallback((data: CreateOrderFormValues) => {
        createCheckOutMutation.mutate(data, {
            onSuccess(data, variables, context) {
                toast.success('Place order successful')
                setCheckOut(data.id)
                createPaymentMutation.mutate({ checkout_id: data.id }, {
                    onSuccess(payment, variables, context) {
                        toast.success('Place payment successful')
                        setPaymentId(payment.payment_id)
                        router.push(payment.approve_url)
                    },
                    onError(error, variables, context) {
                        toast.error('Place payment error')
                    }
                })
            },
            onError(error, variables, context) {
                toast.error('Place order error')
            }
        })
    }, [])


    return (
        <FormProvider {...form}>
            <form
                onSubmit={form.handleSubmit(
                    (values) => {
                        console.log("✅ Valid submit", values)
                        handleSubmit(values)
                    },
                    (errors) => {
                        console.log(errors)
                        toast.error("Please check the form for errors")
                    }
                )}
                className='flex flex-col gap-8 section-padding'
            >
                {/* Breadcrumb */}
                <div className='flex justify-center items-center gap-12 border-b pb-3'>
                    {checkOutBreadcrumb.map((item, index) => (
                        <div key={index} className='flex flex-col gap-2 items-center justify-center'>
                            <Image src={`/${item.icon}`} width={50} height={50} alt='' className='size-12' />
                            <div className='font-semibold text-lg text-secondary'>{item.label}</div>
                        </div>
                    ))}
                </div>

                {/* Shipping Address */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12 lg:px-24 md:px-14 px-4'>
                    <div className='col-span-1 space-y-4 lg:space-y-12'>
                        <AddressSelector addresses={addresses ? addresses : []} name="shipping_address_id" />
                        <PaymentMethodSelector />
                    </div>


                    <div className='col-span-1 space-y-4 lg:space-y-12'>
                        <CartTable
                            cart={
                                cartItems
                                    ? {
                                        ...cartItems,
                                        items: cartItems.items.filter((item) => item.is_active)
                                    }
                                    : undefined
                            }
                            isLoadingCart={isLoadingCart}
                            isCheckout
                            localQuantities={localQuantities}
                            setLocalQuantities={setLocalQuantities}
                        />

                        <div className='space-y-3'>
                            <div className="text-lg font-semibold">Select Voucher</div>
                            <div className='flex flex-row gap-2'>
                                {vouchers.map((item, index) => {
                                    return (
                                        <ProductVoucher item={item} key={index} isSelected={selectedVoucher === item.id} onSelect={() => handleSelectVoucher(item.id)} />
                                    )
                                })}
                            </div>
                        </div>

                        <div className='flex gap-12 items-end'>
                            <div className='flex-1'>
                                <FormField
                                    name='note'
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem className='space-y-1 lg:space-y-1'>
                                            <FormLabel className="text-lg font-semibold">Note</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    className='min-h-24'
                                                    {...field}
                                                    value={field.value ?? ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className='flex flex-row gap-2 mt-4 items-center'>
                                    <Checkbox>
                                    </Checkbox>
                                    <Label className='text-sm flex flex-row'>By placing this order, you accept our<span><Link href={'/'} className='text-secondary underline'>Terms  & Conditions</Link></span></Label>
                                </div>

                            </div>
                            <div className='text-sm space-y-2'>
                                <div className='flex gap-6 justify-end'>
                                    <span>Sub total</span>
                                    <span>
                                        €{cartItems?.items
                                            .reduce((total, item) => total + item.price_whithout_tax, 0)
                                            .toFixed(2)}
                                    </span>
                                </div>
                                <div className='flex gap-6 justify-end'>
                                    <span>Shipping</span>
                                    <span>20</span>
                                </div>
                                <div className='flex gap-6 justify-end'>
                                    <span>Discount</span>
                                    <span>30</span>
                                </div>
                                <div className='flex gap-6 justify-end'>
                                    <span>VAT Tax (19%)</span>
                                    <span>30</span>
                                </div>
                                <div className='flex gap-6 justify-end text-xl text-primary font-bold'>
                                    <span>Total</span>
                                    <span>
                                        €{cartItems?.items
                                            .reduce((total, item) => total + item.final_price, 0)
                                            .toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit">Continue</Button>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    )
}
