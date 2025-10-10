'use client'
import React, { useEffect, useMemo, useState } from 'react'

import CartSummary from '@/components/layout/cart/cart-summary'
import CartTable from '@/components/layout/cart/cart-table'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import { useCartLocal } from '@/hooks/cart'
import { useRouter } from '@/src/i18n/navigation'
import { getCartItems } from '@/features/cart/api'
import { useLocale, useTranslations } from 'next-intl'
import { LoginDrawer } from '@/components/shared/login-drawer'
import CartLocalTable from '@/components/layout/cart/cart-local-table'
import { CartItem, CartResponse, CartResponseItem } from '@/types/cart'
import { CartItemLocal } from '@/lib/utils/cart'

const CartPageClient = () => {
    const [userId, setUserId] = React.useState<string | null>(
        typeof window !== "undefined" ? localStorage.getItem("userId") : ""
    );
    const [isLoginOpen, setIsLoginOpen] = useState(false)
    const t = useTranslations()
    const router = useRouter()
    const locale = useLocale()
    const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({})

    useEffect(() => {
        const handleStorageChange = () => {
            const newUserId = localStorage.getItem("userId");
            setUserId(newUserId);
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const { cart: localCart } = useCartLocal();

    const { data: cart, isLoading: isLoadingCart, isError: isErrorCart } = useQuery({
        queryKey: ["cart-items", userId],
        queryFn: async () => {
            const data = await getCartItems() // CartResponseItem[]
            // Có thể sort theo thời gian tạo của từng giỏ hàng nếu cần
            data.sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
            return data
        },
        retry: false,
        enabled: !!userId,
    })

    // Nếu có user thì hiển thị cart trên server, không thì localCart
    const displayedCart = useMemo(() => userId ? cart ?? [] : localCart, [cart, localCart, userId])

    const { updateStatus } = useCartLocal()

    let total = 0;

    if (userId && cart) {
        // 🛒 Trường hợp user đăng nhập → cart là CartResponse
        total = cart
            .flatMap(group => group.items) // flatten tất cả items trong từng supplier
            .filter(item => item.is_active)
            .reduce((acc, item) => {
                const key = item.id;
                const quantity = localQuantities[key ?? ""] ?? item.quantity;
                return acc + quantity * item.item_price;
            }, 0);
    } else {
        // 🧺 Trường hợp guest → localCart là CartItem[]
        total =
            localCart
                ?.filter(item => item.is_active)
                .reduce((acc, item) => {
                    const key = 'id' in item ? item.id : (item as CartItemLocal).product_id;
                    const quantity = localQuantities[key ?? ''] ?? item.quantity;
                    return acc + quantity * item.item_price;
                }, 0) ?? 0;
    }


    // Proceed checkout
    const proceedToCart = () => {
        if (userId) {
            if (displayedCart.length === 0) {
                toast.error(t('chooseAtLeastCart'))
            } else {
                // Navigate checkout
                router.push('/check-out', { locale })
            }
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
                            cart={cart ?? []}
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
            <LoginDrawer openLogin={isLoginOpen} setOpenLogin={setIsLoginOpen} isCheckOut setUserId={setUserId} />
        </div>
    )
}

export default CartPageClient