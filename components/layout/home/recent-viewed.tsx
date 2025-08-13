import ProductsGridLayout from '@/components/shared/products-grid-layout'
import React from 'react'

const RecentViewed = () => {
    return (
        <div className='container-padding'>
            <h2 className='text-secondary text-4xl font-bold text-center uppercase'>Recent Viewed</h2>
            <ProductsGridLayout />
        </div>
    )
}

export default RecentViewed