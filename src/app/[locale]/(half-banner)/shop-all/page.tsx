'use client'
import CustomBreadCrumb from '@/components/shared/breadcrumb'
import ProductsGridLayout from '@/components/shared/products-grid-layout'
import { SlidersHorizontal } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import FilterSection from '@/components/layout/single-product/filter-section'
import { useGetAllProducts } from '@/features/products/hook'
import { ProductGridSkeleton } from '@/components/shared/product-grid-skeleton'
import { CustomPagination } from '@/components/shared/custom-pagination'
import { useTranslations } from 'next-intl'

export default function ShopAllPage() {
    const t = useTranslations()
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(40)
    const { data: products, isLoading, isError } = useGetAllProducts({ page, page_size: pageSize })
    if (!products || isLoading) return <ProductGridSkeleton length={12} />

    return (
        <div className='pt-3 xl:pb-16 pb-6'>
            <CustomBreadCrumb currentPage='Shop All' />
            <div className=''>
                <h2 className='text-center text-3xl font-bold capitalize text-secondary'>{t('shopAll')}</h2>
                {isLoading || isError || !products ?
                    <ProductGridSkeleton length={12} /> :

                    <div className='filter-section'>
                        <Collapsible>
                            {/* Trigger */}
                            <CollapsibleTrigger asChild>
                                <div className='flex justify-end cursor-pointer mb-2'>
                                    <div className='rounded-full border-primary border w-fit flex gap-1 items-center px-2 py-1'>
                                        <SlidersHorizontal className='text-primary' />
                                        <p className='text-lg'>Filter</p>
                                    </div>
                                </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <FilterSection />
                            </CollapsibleContent>
                        </Collapsible>
                        {/*Products section */}
                        <div className='lg:pt-10 md:pt-3 pt-0 pb-12'>
                            <ProductsGridLayout hasBadge data={products.items} />
                        </div>
                    </div>
                }
            </div>
            <CustomPagination totalPages={products.pagination.total_pages} page={page} onPageChange={setPage} />
        </div >
    )
}

