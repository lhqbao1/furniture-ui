'use client'
import CustomBreadCrumb from '@/components/shared/breadcrumb'
import ProductsGridLayout from '@/components/shared/products-grid-layout'
import React, { useState } from 'react'
import { ProductGridSkeleton } from '@/components/shared/product-grid-skeleton'
import { CustomPagination } from '@/components/shared/custom-pagination'
import { useGetViewedProduct } from '@/features/viewed/hook'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function ViewProductPage() {
    const [page, setPage] = useState(1)
    const { data: products, isLoading, isError } = useGetViewedProduct()
    const t = useTranslations()
    if (!products || isLoading) return <ProductGridSkeleton length={12} />


    return (
        <div className='pt-3 xl:pb-16 pb-6'>
            <CustomBreadCrumb currentPage='Recent Viewed' />
            <div className=''>
                <h2 className='text-center text-3xl font-bold capitalize text-secondary'>{t('viewedProduct')}</h2>
                {isLoading || isError || !products || products.items.length === 0 ?
                    <div className='flex justify-center flex-col items-center lg:mt-10 gap-2'>
                        <div className='text-xl'>No Product Found</div>
                        <Link href={'/shop-all'}>
                            <Button>Continue shop</Button>
                        </Link>
                    </div>
                    :
                    <div className='filter-section'>
                        {/*Products section */}
                        <div className='pt-10 pb-12'>
                            <ProductsGridLayout hasBadge data={products.items} />
                        </div>
                        <CustomPagination totalPages={products.pagination.total_pages} page={page} onPageChange={setPage} />
                    </div>
                }
            </div>
        </div >
    )
}

