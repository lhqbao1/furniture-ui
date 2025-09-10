'use client'
import { ProductGridSkeleton } from '@/components/shared/product-grid-skeleton'
import ProductsGridLayout from '@/components/shared/products-grid-layout'
import { useGetAllProducts } from '@/features/products/hook'
import { useTranslations } from 'next-intl'
import React from 'react'

const RecentViewed = () => {
    const t = useTranslations()

    const { data: products, isLoading, isError } = useGetAllProducts()
    return (
        <div className='section-padding lg:mt-0 mt-40'>
            <h2 className='section-header'>{t('recentViewed')}</h2>
            {isLoading || isError || !products ?
                <ProductGridSkeleton />
                :
                <ProductsGridLayout data={products.items} />

            }
        </div>
    )
}

export default RecentViewed