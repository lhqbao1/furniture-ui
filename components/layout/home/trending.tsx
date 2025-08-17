import ProductsGridLayout from '@/components/shared/products-grid-layout'
import React from 'react'

const TrendingProducts = () => {
    return (
        <div className='section-padding'>
            <h2 className='text-secondary text-4xl font-bold text-center uppercase'>Trending</h2>
            <p className='text-primary text-lg text-center'>most wanted on social media</p>
            <ProductsGridLayout />
        </div>
    )
}

export default TrendingProducts