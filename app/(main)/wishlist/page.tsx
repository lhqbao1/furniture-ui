import { CartTable } from '@/components/layout/wishlist/table'
import CustomBreadCrumb from '@/components/shared/breadcrumb'
import { cartData } from '@/data/data'
import React from 'react'

const WishList = () => {
    return (
        <div className='pt-3 xl:pb-16 pb-6 space-y-4'>
            <CustomBreadCrumb currentPage='wishlist' />
            <h1 className='text-secondary text-5xl font-bold text-center font-libre'>Wishlist</h1>
            <CartTable data={cartData} />
        </div>
    )
}

export default WishList