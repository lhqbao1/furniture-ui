'use client'
import React from 'react'

interface ProductStatisticSkeletonProps {
    count?: number // số lượng ô thống kê muốn render skeleton
}

const ProductStatisticSkeleton = ({ count = 4 }: ProductStatisticSkeletonProps) => {
    return (
        <div className='grid grid-cols-4 gap-4'>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className='rounded-sm py-4 flex flex-col justify-center items-center gap-2 border bg-gray-200 animate-pulse'
                    style={{ opacity: 0.5 }}
                >
                    <div className='h-8 w-20 bg-gray-300 rounded' />
                    <div className='h-4 w-16 bg-gray-300 rounded mt-2' />
                </div>
            ))}
        </div>
    )
}

export default ProductStatisticSkeleton
