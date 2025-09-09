'use client'
import WishlistTable from '@/components/layout/wishlist/table'
import CustomBreadCrumb from '@/components/shared/breadcrumb'
import { useGetWishlist } from '@/features/wishlist/hook'
import { Loader2 } from 'lucide-react'
import React, { useState } from 'react'

const WishList = () => {
    const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({})

    const { data: wishlist, isLoading, isError } = useGetWishlist()


    const total =
        wishlist?.items
            ?.filter((item) => item.is_active)
            .reduce(
                (acc, item) =>
                    acc + (localQuantities[item.id] ?? item.quantity) * item.item_price,
                0
            ) ?? 0

    return (
        <div className='pt-3 xl:pb-16 pb-6 space-y-4'>
            <CustomBreadCrumb currentPage='wishlist' />
            <h1 className='text-secondary text-5xl font-bold text-center font-libre'>Wishlist</h1>

            {isLoading && (
                <div className='flex w-full justify-center'>
                    <Loader2 className='animate-spin' />
                </div>
            )}

            {isError && (
                <div className='text-center text-red-500 text-lg'>
                    You need to login
                </div>
            )}

            {!isLoading && !isError && wishlist && (
                <WishlistTable
                    wishlist={wishlist}
                    localQuantities={localQuantities}
                    setLocalQuantities={setLocalQuantities}
                    total={total}
                />
            )}
        </div>

    )
}

export default WishList