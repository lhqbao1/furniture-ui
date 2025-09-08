'use client'
import ProductsGridLayout from '@/components/shared/products-grid-layout'
import { useGetAllProducts } from '@/features/products/hook'
import React from 'react'

const RecentViewed = () => {
    const { data: products, isLoading, isError } = useGetAllProducts()
    if (isLoading) return <div>Loading...</div>
    if (isError) return <div className="text-red-500">❌ Failed to load products.</div>
    if (!products) return <div className="text-red-500">No products found.</div>

    return (
        <div className='section-padding'>
            <h2 className='section-header'>Recent Viewed</h2>
            <ProductsGridLayout data={products.items} />
        </div>
    )
}

export default RecentViewed