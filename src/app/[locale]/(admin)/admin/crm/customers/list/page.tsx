'use client'
import { customerColumns } from '@/components/layout/admin/customers/columns'
import { ProductTable } from '@/components/layout/admin/products/products-list/product-table'
import ProductStatistic from '@/components/layout/admin/products/products-list/statistic'
import ProductTableSkeleton from '@/components/shared/table-skeleton'
import { useGetAllCustomers } from '@/features/users/hook'
import { Loader2 } from 'lucide-react'
import React, { useState } from 'react'

const userStatistics = [
    { total: 9999999, label: 'Total sale', textColor: 'rgb(81, 190, 140)' },
    { total: 5654564, label: 'Total cost', textColor: 'rgb(255, 11, 133)' },
    { total: 2345678, label: 'Total discount', textColor: 'rgb(250, 166, 26)' },
    { total: 1543234, label: 'ESTIMATED PROFIT 20%', textColor: 'rgb(41, 171, 226)' }
]


const CustomerListPage = () => {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const { data, isLoading, isError } = useGetAllCustomers()

    if (isError) return <div>No data</div>
    if (isLoading) return <div className="flex justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className='space-y-12'>
            {/* <ProductStatistic statistic={userStatistics} /> */}
            <div className='text-3xl text-secondary font-bold text-center'>Customers List</div>
            {isLoading || !data ? <ProductTableSkeleton /> :
                <ProductTable
                    data={data ? data : []}
                    columns={customerColumns}
                    page={page}
                    pageSize={pageSize}
                    setPage={setPage}
                    setPageSize={setPageSize}
                    totalItems={data?.length}
                    totalPages={Math.ceil((data?.length ?? 0) / pageSize)}
                    addButtonText='none'
                />
            }
        </div>
    )
}

export default CustomerListPage