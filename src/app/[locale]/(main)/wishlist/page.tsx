'use client'
import WishlistTable from '@/components/layout/wishlist/table'
import CustomBreadCrumb from '@/components/shared/breadcrumb'
import ProductTableSkeleton from '@/components/shared/table-skeleton'
import { useGetWishlist } from '@/features/wishlist/hook'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

const WishList = () => {
    const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({})
    const t = useTranslations()
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
            <h1 className='text-secondary text-5xl font-bold text-center'>{t('wishlist')}</h1>

            {isLoading || isError || !wishlist ?
                <ProductTableSkeleton />
                : (
                    <WishlistTable
                        wishlist={wishlist}
                        localQuantities={localQuantities}
                        setLocalQuantities={setLocalQuantities}
                        total={total}
                        currentTable={t('wishlistProducts')}
                    />
                )}
        </div>

    )
}

export default WishList