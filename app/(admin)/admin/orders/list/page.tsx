'use client'
import { orderColumns } from '@/components/layout/admin/orders/order-list/column'
import { ProductTable } from '@/components/layout/admin/products/products-list/product-table'
import ProductStatistic from '@/components/layout/admin/products/products-list/statistic'
import { useGetCheckOut, useGetCheckOutStatistic } from '@/features/checkout/hook'
import { Loader2 } from 'lucide-react'
import React, { Suspense } from 'react'

const OrderList = () => {
    const { data, isLoading, isError } = useGetCheckOut()
    const { data: statistic, isLoading: isLoadingStatistic, isError: isErrorStatistic } = useGetCheckOutStatistic()

    console.log(statistic)

    if (isError || isErrorStatistic) return <div>No data</div>
    if (isLoading || isLoadingStatistic) return <div>Loading</div>
    // map statistic từ API vào demo
    const mergedStatistic = [
        {
            total: statistic?.order_processing ?? 0,
            label: 'Orders Processing',
            textColor: 'rgb(41, 171, 226)',
        },
        {
            total: statistic?.processing_transaction ?? 0,
            label: 'Processing Transaction',
            textColor: 'rgb(255, 11, 133)',
        },
        {
            total: statistic?.cancel_transaction ?? 0,
            label: 'Returned',
            textColor: 'rgba(242, 5, 5, 0.8)',
        },
        {
            total: statistic?.completed_transaction ?? 0,
            label: 'Done',
            textColor: 'rgb(81, 190, 140)',
        },
    ]

    return (
        <div className='space-y-12 pb-30'>
            <ProductStatistic statistic={mergedStatistic} />
            <Suspense fallback={<Loader2 className="animate-spin" />} >
                <ProductTable data={data ? data : []} columns={orderColumns} />
            </Suspense>
        </div>
    )
}

export default OrderList