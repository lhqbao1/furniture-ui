'use client'
import CustomBreadCrumb from '@/components/shared/breadcrumb'
import ProductsGridLayout from '@/components/shared/products-grid-layout'
import { SlidersHorizontal } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useMemo, useState } from 'react'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import FilterSection from '@/components/layout/single-product/filter-section'
import { useGetAllProducts } from '@/features/products/hook'
import { ProductGridSkeleton } from '@/components/shared/product-grid-skeleton'
import { CustomPagination } from '@/components/shared/custom-pagination'
import { useTranslations } from 'next-intl'
import { useGetProductsSelect } from '@/features/product-group/hook'

export default function SaleProductsPage() {
    const t = useTranslations()
    const { data: products, isLoading, isError } = useGetProductsSelect()

    const newProducts = useMemo(() => {
        if (!products) return []

        return [...products]
            .filter(p =>
                !!p.created_at &&
                typeof p.price === 'number' &&
                typeof p.final_price === 'number' &&
                p.final_price < p.price // chỉ lấy sản phẩm đang giảm giá
            )
            .sort((a, b) => {
                const dateA = new Date(a.created_at ?? 0).getTime()
                const dateB = new Date(b.created_at ?? 0).getTime()
                return dateB - dateA
            })
            .slice(0, 8)
    }, [products])



    if (!products || isLoading) return <ProductGridSkeleton length={12} />



    return (
        <div className='pt-3 xl:pb-16 pb-6'>
            <CustomBreadCrumb currentPage={t('sale')} />
            <div className=''>
                <h2 className='section-header'>{t('sale')}</h2>
                {isLoading || isError || !products ?
                    <ProductGridSkeleton length={12} /> :

                    <div className='filter-section'>
                        {/* <Collapsible>
                            Trigger
                            <CollapsibleTrigger asChild>
                                <div className='flex justify-end cursor-pointer mb-2 lg:ml-30'>
                                    <div className='rounded-full border-primary border w-fit flex gap-1 items-center px-2 py-1'>
                                        <SlidersHorizontal className='text-primary' />
                                        <p className='text-lg'>Filter</p>
                                    </div>
                                </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <FilterSection />
                            </CollapsibleContent>
                        </Collapsible> */}
                        {/*Products section */}
                        <div className='lg:pt-10 md:pt-3 pt-0 pb-12'>
                            <ProductsGridLayout hasBadge data={newProducts} />
                        </div>
                    </div>
                }
            </div>
            {/* <CustomPagination totalPages={products.pagination.total_pages} page={page} onPageChange={setPage} /> */}
        </div >
    )
}

