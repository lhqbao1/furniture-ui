'use client'
import { useGetAllProducts } from '@/features/products/hook'
import React from 'react'

export const statistic = [
    {
        total: 9999999,
        label: 'Total sale',
        color: 'rgb(81, 190, 140,0.35)',
        textColor: 'rgb(81, 190, 140)'
    },
    {
        total: 5654564,
        label: 'Total cost',
        color: 'rgb(255, 11, 133,0.35)',
        textColor: 'rgb(255, 11, 133)'
    },
    {
        total: 2345678,
        label: 'Total discount',
        color: 'rgb(250, 166, 26,0.35)',
        textColor: 'rgb(250, 166, 26)',
    },
    {
        total: 1543234,
        label: 'ESTIMATED PROFIT 20%',
        color: 'rgb(41, 171, 226,0.35)',
        textColor: 'rgb(41, 171, 226)'
    }
]


const ProductStatistic = () => {
    const { data, isLoading, isError } = useGetAllProducts()
    if (isError) return <div>Error</div>
    if (isLoading) return <div>Loading</div>

    return (
        <div className='grid grid-cols-4 gap-4'>
            {statistic.map((item, index) => {
                return (
                    <div key={index} className={`rounded-sm py-4 flex flex-col justify-center items-center gap-2`} style={{
                        backgroundColor: item.color,
                        opacity: 30
                    }}>
                        <div className={`text-3xl font-bold`} style={{
                            color: item.textColor
                        }}>
                            €{(item.total).toLocaleString()}
                        </div>
                        <div className={`uppercase`} style={{
                            color: item.textColor
                        }}>
                            {item.label}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default ProductStatistic