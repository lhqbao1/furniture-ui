'use client'

import { productColumns } from '@/components/layout/admin/products/products-list/column'
import { ProductTable } from '@/components/layout/admin/products/products-list/product-table'
import TableToolbar from '@/components/layout/admin/products/products-list/toolbar'
import ProductTableSkeleton from '@/components/shared/table-skeleton'
import { useGetAllProducts } from '@/features/products/hook'
import { Loader2 } from 'lucide-react'
import React, { useState } from 'react'

const statisticDemo = [
    { total: 0, label: 'Total sale', textColor: 'rgb(81, 190, 140)' },
    { total: 0, label: 'Total cost', textColor: 'rgb(255, 11, 133)' },
    { total: 0, label: 'Total discount', textColor: 'rgb(250, 166, 26)' },
    { total: 0, label: 'ESTIMATED PROFIT 20%', textColor: 'rgb(41, 171, 226)' }
]

const ProductList = () => {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(50)
    const [searchQuery, setSearchQuery] = useState<string>('')

    const { data, isLoading, isError } = useGetAllProducts({ page, page_size: pageSize, all_products: true, search: searchQuery })

    if (isError) return <div>No data</div>
    // if (isLoading) return <div className="flex justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className='space-y-12'>
            {/* <ProductStatistic statistic={statisticDemo} /> */}
            <div className='text-3xl text-secondary font-bold text-center'>Product List</div>
            <TableToolbar
                searchQuery={searchQuery}
                pageSize={pageSize}
                setPageSize={setPageSize} // đảm bảo type đúng
                addButtonText='Add Product'
                addButtonUrl='/admin/products/add'
                setSearchQuery={setSearchQuery}
            />
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
                    setSearchQuery={setSearchQuery}
                />
            }
        </div>
    )
}

export default ProductList
