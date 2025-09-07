'use client'
import { productColumns } from '@/components/layout/admin/products/products-list/column'
import { ProductTable } from '@/components/layout/admin/products/products-list/product-table'
import ProductStatistic from '@/components/layout/admin/products/products-list/statistic'
import { useGetAllProducts } from '@/features/products/hook'
import { Loader2 } from 'lucide-react'
import React, { Suspense } from 'react'

const statisticDemo = [
    {
        total: 9999999,
        label: 'Total sale',
        textColor: 'rgb(81, 190, 140)'
    },
    {
        total: 5654564,
        label: 'Total cost',
        textColor: 'rgb(255, 11, 133)'
    },
    {
        total: 2345678,
        label: 'Total discount',
        textColor: 'rgb(250, 166, 26)',
    },
    {
        total: 1543234,
        label: 'ESTIMATED PROFIT 20%',
        textColor: 'rgb(41, 171, 226)'
    }
]

const ProductList = () => {
    const { data, isLoading, isError } = useGetAllProducts()
    if (isError) return <div>No data</div>
    if (isLoading) return <div>Loading</div>

    return (
        <div className='space-y-12'>
            <ProductStatistic statistic={statisticDemo} />
            <Suspense fallback={<Loader2 className="animate-spin" />} >
                <ProductTable data={data ? data : []} columns={productColumns} />
            </Suspense>
        </div>
    )
}

export default ProductList