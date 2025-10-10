'use client'
import { orderChildSupplierColumns } from '@/components/layout/admin/orders/order-list/column'
import { ProductTable } from '@/components/layout/admin/products/products-list/product-table'
import ProductTableSkeleton from '@/components/shared/table-skeleton'
import { useGetCheckOutSupplier } from '@/features/checkout/hook'
import React, { useState } from 'react'

const DSPOrderList = () => {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(50)
    const { data, isLoading, isError } = useGetCheckOutSupplier({ page, page_size: pageSize })

    return (
        <div className='space-y-12 pb-30'>
            <div className='text-3xl text-secondary font-bold text-center'>Order List</div>
            {isLoading ? <ProductTableSkeleton columnsCount={6} rowsCount={6} /> :
                <ProductTable
                    data={data ? data.items : []}
                    columns={orderChildSupplierColumns}
                    page={page}
                    setPage={setPage}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                    totalItems={data?.pagination.total_items ?? 0}
                    totalPages={data?.pagination.total_pages ?? 0}
                    hasBackground
                />
            }
        </div>
    )
}

export default DSPOrderList