'use client'

import { productMarketplaceColumns } from '@/components/layout/admin/products/marketplace/columns'
import { productColumns } from '@/components/layout/admin/products/products-list/column'
import { ProductTable } from '@/components/layout/admin/products/products-list/product-table'
import TableToolbar from '@/components/layout/admin/products/products-list/toolbar'
import AdminBackButton from '@/components/shared/admin-back-button'
import ProductTableSkeleton from '@/components/shared/table-skeleton'
import { useGetProductsSelect } from '@/features/product-group/hook'
import { useGetAllProducts } from '@/features/products/hook'
import { searchProductQueryStringAtom } from '@/store/product'
import { useAtom } from 'jotai'
import React, { useMemo, useState } from 'react'


const ProductMarketplace = () => {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(50)
    const [searchQuery, setSearchQuery] = useAtom<string>(searchProductQueryStringAtom)

    const { data, isLoading, isError } = useGetAllProducts({ page, page_size: pageSize, all_products: true, search: searchQuery })
    const { data: exportData, isLoading: isLoadingProductExport, isError: isErrorProductExport } = useGetProductsSelect()

    const sortedData = useMemo(() => {
        if (!data?.items) return []
        // Sort is_active: true (active) lên trước
        return [...data.items].sort((a, b) => {
            if (a.is_active === b.is_active) return 0
            return a.is_active ? -1 : 1
        })
    }, [data?.items])

    if (isError || !data) return <ProductTableSkeleton />
    // if (isLoading) return <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
    const columns = productMarketplaceColumns(data?.items)

    return (
        <div className='space-y-6'>
            <AdminBackButton />
            <div className='space-y-12 pb-12'>
                {/* <ProductStatistic statistic={statisticDemo} /> */}
                <div className='text-3xl text-secondary font-bold text-center'>Product Marketplace</div>
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
                        data={sortedData}
                        columns={columns}
                        page={page}
                        pageSize={pageSize}
                        setPage={setPage}
                        setPageSize={setPageSize}
                        totalItems={data?.pagination.total_items ?? 0}
                        totalPages={data?.pagination.total_pages ?? 0}
                    />
                }
            </div>
        </div>
    )
}

export default ProductMarketplace
