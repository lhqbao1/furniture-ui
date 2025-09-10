'use client'
import { orderColumns } from '@/components/layout/admin/orders/order-list/column'
import { ProductTable } from '@/components/layout/admin/products/products-list/product-table'
import ProductStatistic from '@/components/layout/admin/products/products-list/statistic'
import ProductStatisticSkeleton from '@/components/shared/statistic-skeleton'
import ProductTableSkeleton from '@/components/shared/table-skeleton'
import { useGetCheckOut, useGetCheckOutStatistic } from '@/features/checkout/hook'
import React, { useState } from 'react'

const OrderList = () => {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const { data, isLoading, isError } = useGetCheckOut()
    const { data: statistic, isLoading: isLoadingStatistic, isError: isErrorStatistic } = useGetCheckOutStatistic()

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
            {isLoadingStatistic || !statistic ? <ProductStatisticSkeleton /> : <ProductStatistic statistic={mergedStatistic} />}
            <div className='text-3xl text-secondary font-bold text-center'>Order List</div>
            {isLoading ? <ProductTableSkeleton columnsCount={6} rowsCount={6} /> :
                <ProductTable
                    data={data ? data : []}
                    columns={orderColumns}
                    page={page}
                    setPage={setPage}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                    totalItems={data?.length ?? 0}
                    totalPages={Math.ceil((data?.length ?? 0) / pageSize)}
                    hasBackground
                />
            }
        </div>
    )
}

export default OrderList