'use client'
import React, { useEffect, useState } from 'react'

import CartSummary from '@/components/layout/cart/cart-summary'
import CartTable from '@/components/layout/cart/cart-table'
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCartLocal } from '@/hooks/cart'
import { CartLocalTable } from '@/components/layout/cart/cart-local-table'
import { useRouter } from '@/src/i18n/navigation'
import { getCartItems } from '@/features/cart/api'
import { useTranslations } from 'next-intl'
import { LoginDrawer } from '@/components/shared/login-drawer'


const CartPage = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoginOpen, setIsLoginOpen] = useState(false)
    const t = useTranslations()


    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) setUserId(storedUserId);
    }, []);

    const { cart: localCart } = useCartLocal();
    const { data: cart, isLoading: isLoadingCart, isError: isErrorCart } = useQuery({
        queryKey: ["cart-items", userId],
        queryFn: async () => {
            const data = await getCartItems()
            // Sort theo created_at giảm dần (mới nhất lên trước)
            data.items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            return data
        },
        retry: false,
        enabled: !!userId
    })

    const displayedCart = userId ? cart?.items ?? [] : localCart;
    const { updateStatus } = useCartLocal()

    const router = useRouter()
    const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({})

    // get userId from localStorage (client side)
    useEffect(() => {
        const storedUserId = localStorage.getItem('userId')
        if (storedUserId) setUserId(storedUserId)
    }, [])

    //Calculate total amount 
    const total =
        displayedCart
            ?.filter(item => item.is_active)
            .reduce((acc, item) => {
                const key = 'id' in item ? item.id : item.product_id;
                const quantity = localQuantities[key ?? ''] ?? item.quantity;
                return acc + quantity * item.item_price;
            }, 0) ?? 0;

    // Proceed checkout
    const proceedToCart = () => {
        if (userId) {
            if (displayedCart.length === 0) {
                toast.error(t('chooseAtLeastCart'))
                return
            }
            // Navigate checkout
            router.push('/check-out')
        } else {
            if (displayedCart.length === 0) {
                toast.error(t('chooseAtLeastCart'))
                return
            }
            // Nếu chưa login → mở dialog
            setIsLoginOpen(true)
        }
    }


    return (
        <div className='mt-6 lg:px-0 px-4'>
            <div className="w-full lg:max-w-6xl mx-auto lg:p-6">
                <div className="grid grid-cols-12 xl:gap-16 gap-6">
                    {/* Left: Cart Items */}
                    {
                        userId ? (<CartTable
                            isLoadingCart={isLoadingCart}
                            cart={cart}
                            localQuantities={localQuantities}
                            setLocalQuantities={setLocalQuantities}
                            isCheckout={false}
                        />) :
                            (
                                <CartLocalTable
                                    data={localCart}
                                    onToggleItem={(product_id, is_active) =>
                                        updateStatus({ product_id, is_active })
                                    }
                                    onToggleAll={(is_active) => {
                                        localCart.forEach(item => updateStatus({ product_id: item.product_id, is_active }))
                                    }}
                                />

                            )
                    }

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
            <LoginDrawer openLogin={isLoginOpen} setOpenLogin={setIsLoginOpen} isCheckOut />
        </div>
    )
}

export default CartPage