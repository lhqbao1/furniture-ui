'use client'
import CustomBreadCrumb from '@/components/shared/breadcrumb'
import { useParams } from 'next/navigation'
import React from 'react'

const ProductDetails = () => {
    const params = useParams()
    const { type, category, slug } = params

    return (
        <div className='py-3'>
            <CustomBreadCrumb />
            <h1>Product Detail</h1>
            <p>Type: {type}</p>
            <p>Category: {category}</p>
            <p>Product ID: {slug}</p>
        </div>
    )
}

export default ProductDetails