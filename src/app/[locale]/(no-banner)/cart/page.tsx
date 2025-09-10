'use client'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import Image from 'next/image'
import { useGetCartItems } from '@/features/cart/hook'
import CartSummary from '@/components/layout/cart/cart-summary'
import CartTable from '@/components/layout/cart/cart-table'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getAddressByUserId, getInvoiceAddressByUserId } from '@/features/address/api'


const CartPage = () => {
    const { data: cart, isLoading: isLoadingCart, isError: isErrorCart } = useGetCartItems()
    const router = useRouter()
    const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({})
    const [userId, setUserId] = useState<string | null>(null)

    // get userId from localStorage (client side)
    useEffect(() => {
        const storedUserId = localStorage.getItem('userId')
        if (storedUserId) setUserId(storedUserId)
    }, [])

    // Call api get address if userId
    const { data: addresses } = useQuery({
        queryKey: ["address-by-user"],
        queryFn: () => getAddressByUserId(userId!),
        retry: false,
        enabled: !!userId,
    })

    const { data: invoiceAddress } = useQuery({
        queryKey: ["invoice-address-by-user"],
        queryFn: () => getInvoiceAddressByUserId(userId!),
        retry: false,
        enabled: !!userId,
    })

    //Calculate total amount 
    const total =
        cart?.items
            ?.filter((item) => item.is_active)
            .reduce(
                (acc, item) =>
                    acc + (localQuantities[item.id] ?? item.quantity) * item.item_price,
                0
            ) ?? 0

    //Handle when user click proceed to checkout
    // Proceed checkout
    const proceedToCart = () => {
        if (cart) {
            const hasActiveItem = cart.items.some((item) => item.is_active)

            if (!hasActiveItem) {
                toast.error("You need to choose at least one product to check out")
                return
            }

            // Kiểm tra address
            const hasShippingAddress = (addresses?.length ?? 0) > 0
            const hasInvoiceAddress = invoiceAddress

            if (!hasShippingAddress || !hasInvoiceAddress) {
                toast.error("Missing addresses", {
                    description: (
                        <div className='flex flex-col gap-2'>
                            You need to create at least one shipping address and one invoice address.
                            <Link href="/contact" className="underline text-red-600">
                                Create address
                            </Link>
                        </div>
                    ),
                })
                return
            }

            // Navigate checkout
            router.push('/check-out')
        }
    }

    return (
        <div>
            <div className='text-center flex flex-col items-center gap-3 xl:text-5xl text-3xl bg-gray-100 xl:py-10 py-4'>
                <Image
                    src={'/new-logo.svg'}
                    height={100}
                    width={100}
                    alt=''
                />
                <Link href={'/'} className='cursor-pointer space-x-2'>
                    <span className='text-secondary font-libre font-bold'>Prestige</span>
                    <span className='text-primary font-libre font-bold'>Home</span>
                </Link>
            </div>
            <div className='container-padding'>
                <div className="w-full max-w-6xl mx-auto p-6">
                    <div className="grid grid-cols-12 xl:gap-16 gap-6">
                        {/* Left: Cart Items */}
                        <CartTable
                            isLoadingCart={isLoadingCart}
                            cart={cart}
                            localQuantities={localQuantities}
                            setLocalQuantities={setLocalQuantities}
                        />

                        {/* Right: Summary */}
                        <div className='col-span-12 md:col-span-4'>
                            <CartSummary
                                total={total}
                                onCheckout={proceedToCart}
                                cart={cart}
                            />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default CartPage