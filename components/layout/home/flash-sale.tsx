'use client'
import CountDownGridLayout from '@/components/shared/count-down-grid-layout'
import { ProductGridSkeleton } from '@/components/shared/product-grid-skeleton'
import { useGetAllProducts } from '@/features/products/hook'
import { useTranslations } from 'next-intl'
import React from 'react'

const FlashSale = () => {
    const t = useTranslations()
    const { data: products, isLoading, isError } = useGetAllProducts()

    return (
        <div className='section-padding'>
            <h2 className='text-secondary text-5xl font-bold text-center capitalize font-libre mb-2'>{t('flashSale')}</h2>
            <p className='text-primary text-lg text-center uppercase'>{t('upTo')} 50%</p>
            {!products || isLoading || isError ? <ProductGridSkeleton length={8} /> : <CountDownGridLayout products={products.items} />}
        </div>
    )
}

export default FlashSale