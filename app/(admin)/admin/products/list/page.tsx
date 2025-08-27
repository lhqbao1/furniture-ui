'use client'
import { productColumns } from '@/components/layout/admin/products/products-list/column'
import { ProductTable } from '@/components/layout/admin/products/products-list/product-table'
import ProductStatistic from '@/components/layout/admin/products/products-list/statistic'
import { useGetAllProducts } from '@/features/products/hook'
import { Loader2 } from 'lucide-react'
import React, { Suspense } from 'react'

const ProductList = () => {
    const { data, isLoading, isError } = useGetAllProducts()
    if (isError) return <div>Error</div>
    if (isLoading) return <div>Loading</div>

    return (
        <div className='space-y-12'>
            <ProductStatistic />
            <Suspense fallback={<Loader2 className="animate-spin" />} >
                <ProductTable data={data ? data.items : []} columns={productColumns} pagination={data.pagination} />
            </Suspense>
        </div>
    )
}

export default ProductList