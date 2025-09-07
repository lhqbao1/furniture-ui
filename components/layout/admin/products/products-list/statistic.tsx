'use client'
import { Statistic } from '@/types/statistics'
import React from 'react'

interface StatisticsProps {
    statistic?: Statistic[]
}


const ProductStatistic = ({ statistic }: StatisticsProps) => {
    return (
        <div className='grid grid-cols-4 gap-4'>
            {(statistic ?? []).map((item, index) => {
                return (
                    <div key={index} className={`rounded-sm py-4 flex flex-col justify-center items-center gap-2 border`} style={{
                        backgroundColor: item.color ? item.color : 'white',
                        opacity: 30
                    }}>
                        <div className={`text-3xl font-light text-[#4D4D4D]`}>
                            €{(item.total).toLocaleString()}
                        </div>
                        <div className={`uppercase font-semibold`} style={{
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