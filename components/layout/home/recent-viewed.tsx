import ProductsGridLayout from '@/components/shared/products-grid-layout'
import { trendingProducts } from '@/data/data'
import React from 'react'

const RecentViewed = () => {
    return (
        <div className='section-padding'>
            <h2 className='text-secondary text-4xl font-bold text-center uppercase'>Recent Viewed</h2>
            <ProductsGridLayout data={trendingProducts} />
        </div>
    )
}

export default RecentViewed