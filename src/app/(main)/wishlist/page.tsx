'use client'
import WishlistTable from '@/components/layout/wishlist/table'
import CustomBreadCrumb from '@/components/shared/breadcrumb'
import { useGetWishlist } from '@/features/wishlist/hook'
import { Loader2 } from 'lucide-react'
import React, { useState } from 'react'

const WishList = () => {
    const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({})

    const { data: wishlist, isLoading, isError } = useGetWishlist()

    return (
        <div className='pt-3 xl:pb-16 pb-6 space-y-4'>
            <CustomBreadCrumb currentPage='wishlist' />
            <h1 className='text-secondary text-5xl font-bold text-center font-libre'>Wishlist</h1>
            {!wishlist ? <div className='flex w-full justify-center'><Loader2 className='animate-spin' /></div> :
                <WishlistTable wishlist={wishlist} localQuantities={localQuantities} setLocalQuantities={setLocalQuantities} />
            }

        </div>
    )
}

export default WishList