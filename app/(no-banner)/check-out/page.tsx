'use client'

import AddressSelector from '@/components/layout/checkout/shipping'
import Image from 'next/image'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { z } from "zod"
import PaymentMethodSelector from '@/components/layout/checkout/method'
import CartItemSelector from '@/components/layout/checkout/cart-products'
import { cartItems, vouchers } from '@/data/data'
import ProductVoucher from '@/components/shared/product-voucher'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

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

const cartItemSchema = z.object({
    id: z.number(),
    name: z.string(),
    color: z.string(),
    size: z.string(),
    unitPrice: z.number(),
    quantity: z.number().min(1),
    imageUrl: z.string(),
})

const CheckoutSchema = z.object({
    shipping_address: z.string().min(1, "Please select a shipping address"),
    payment_method: z.string().min(1, "Please select a payment method"),
    products: z.array(cartItemSchema).min(1, "Giỏ hàng không được để trống"),
    note: z.string().optional(),
    total_price: z.number().optional(),
    total: z.number().optional()
})



type CheckoutValues = z.infer<typeof CheckoutSchema>

export default function CheckOutPage() {
    const [selectedVoucher, setSelectedVoucher] = useState<number>()

    const SHIPPING_FEE = 20
    const DISCOUNT = 30
    const VAT_PERCENT = 0.19

    const handleSelectVoucher = useCallback((item: number) => {
        setSelectedVoucher(item)
    }, [])

    const calculateTotalPrice = useCallback((items: CartItem[]) => {
        return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    }, [])

    const subtotal = useMemo(() => calculateTotalPrice(cartItems), [cartItems, calculateTotalPrice])
    const vat = useMemo(() => subtotal * VAT_PERCENT, [subtotal])
    const total = useMemo(() => subtotal + SHIPPING_FEE + vat - DISCOUNT, [subtotal, vat])

    const form = useForm<CheckoutValues>({
        resolver: zodResolver(CheckoutSchema),
        defaultValues: {
            shipping_address: "home",
            payment_method: "paypal",
            products: cartItems,
            note: '',
            total_price: subtotal,
            total: total
        },
    })

    useEffect(() => {
        const products = form.getValues("products")
        const newSubtotal = calculateTotalPrice(products)
        const newVat = newSubtotal * VAT_PERCENT
        const newTotal = newSubtotal + SHIPPING_FEE + newVat - DISCOUNT

        form.setValue("total_price", newSubtotal)
        form.setValue("total", newTotal)
    }, [form.watch("products"), calculateTotalPrice])

    const onSubmit = useCallback((data: CheckoutValues) => {
        console.log("Selected shipping address:", data)
    }, [])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-8 section-padding'>
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
                        <FormField
                            control={form.control}
                            name="shipping_address"
                            render={({ field }) => (
                                <FormItem className='space-y-2 lg:space-y-3'>
                                    <FormLabel className="text-lg font-semibold">Shipping To</FormLabel>
                                    <FormControl>
                                        <AddressSelector field={field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="payment_method"
                            render={({ field }) => (
                                <FormItem className='space-y-2 lg:space-y-3'>
                                    <FormLabel className="text-lg font-semibold">Payment Method</FormLabel>
                                    <FormControl>
                                        <PaymentMethodSelector field={field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className='col-span-1 space-y-4 lg:space-y-12'>
                        <FormField
                            control={form.control}
                            name="products"
                            render={({ field }) => (
                                <FormItem className='space-y-2 lg:space-y-3'>
                                    <FormLabel className="text-lg font-semibold">Cart Items</FormLabel>
                                    <FormControl>
                                        <CartItemSelector field={field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='space-y-3'>
                            <div className="text-lg font-semibold">Select Voucer</div>
                            <div className='flex flex-row gap-2'>
                                {vouchers.map((item, index) => {
                                    return (
                                        <ProductVoucher item={item} key={index} isSelected={selectedVoucher === item.id} onSelect={() => handleSelectVoucher(item.id)} />
                                    )
                                })}
                            </div>
                        </div>

                        <div className='flex gap-12 items-end'>
                            <div className='text-sm space-y-2'>
                                <div className='flex gap-6 justify-end'>
                                    <span>Sub total</span>
                                    <span>
                                        €{form
                                            .getValues("products")
                                            .reduce((total, item) => total + item.unitPrice * item.quantity, 0)
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
                                        €{form
                                            .getValues("products")
                                            .reduce((total, item) => total + item.unitPrice * item.quantity, 0)
                                            .toFixed(2)}
                                    </span>
                                </div>
                            </div>
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
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit">Continue to Payment</Button>
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    )
}
