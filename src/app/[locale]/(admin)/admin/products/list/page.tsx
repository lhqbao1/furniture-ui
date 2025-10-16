'use client'

import { productColumns } from '@/components/layout/admin/products/products-list/column'
import { ProductTable } from '@/components/layout/admin/products/products-list/product-table'
import TableToolbar from '@/components/layout/admin/products/products-list/toolbar'
import AdminBackButton from '@/components/shared/admin-back-button'
import ProductTableSkeleton from '@/components/shared/table-skeleton'
import { useGetProductsSelect } from '@/features/product-group/hook'
import { useGetAllProducts } from '@/features/products/hook'
import { searchProductQueryStringAtom } from '@/store/product'
import { useAtom } from 'jotai'
import React, { useState } from 'react'


const ProductList = () => {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(50)
    const [searchQuery, setSearchQuery] = useAtom<string>(searchProductQueryStringAtom)

    const { data, isLoading, isError } = useGetAllProducts({ page, page_size: pageSize, all_products: true, search: searchQuery })
    const { data: exportData, isLoading: isLoadingProductExport, isError: isErrorProductExport } = useGetProductsSelect()
    if (isError) return <div>No data</div>

    return (
        <div className='lg:space-y-12 space-y-6 pb-12'>
            <AdminBackButton />
            {/* <ProductStatistic statistic={statisticDemo} /> */}
            <div className='text-3xl text-secondary font-bold text-center'>Product List</div>
            <TableToolbar
                searchQuery={searchQuery}
                pageSize={pageSize}
                setPageSize={setPageSize}
                addButtonText='Add Product'
                addButtonUrl='/admin/products/add'
                setSearchQuery={setSearchQuery}
                exportData={exportData}
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
                />
            }
        </div>
    )
}

export default ProductList
