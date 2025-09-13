'use client'

import { productColumns } from '@/components/layout/admin/products/products-list/column'
import { ProductTable } from '@/components/layout/admin/products/products-list/product-table'
import ProductStatistic from '@/components/layout/admin/products/products-list/statistic'
import ProductTableSkeleton from '@/components/shared/table-skeleton'
import { useGetAllProducts } from '@/features/products/hook'
import { Loader2 } from 'lucide-react'
import React, { useState } from 'react'

const statisticDemo = [
    { total: 9999999, label: 'Total sale', textColor: 'rgb(81, 190, 140)' },
    { total: 5654564, label: 'Total cost', textColor: 'rgb(255, 11, 133)' },
    { total: 2345678, label: 'Total discount', textColor: 'rgb(250, 166, 26)' },
    { total: 1543234, label: 'ESTIMATED PROFIT 20%', textColor: 'rgb(41, 171, 226)' }
]

const ProductList = () => {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const { data, isLoading, isError } = useGetAllProducts({ page, page_size: pageSize, all_products: true })

    if (isError) return <div>No data</div>
    if (isLoading) return <div className="flex justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className='space-y-12'>
            <ProductStatistic statistic={statisticDemo} />
            <div className='text-3xl text-secondary font-bold text-center font-libre'>Product List</div>
            {isLoading ? <ProductTableSkeleton /> :
                <ProductTable
                    data={data ? data.items : []}
                    columns={productColumns}
                    page={page}
                    pageSize={pageSize}
                    setPage={setPage}
                    setPageSize={setPageSize}
                    totalItems={data?.pagination.total_items ?? 0}
                    totalPages={data?.pagination.total_pages ?? 0}
                    addButtonText='Add Product'
                    addButtonUrl='/admin/products/add'
                />
            }
        </div>
    )
}

export default ProductList
