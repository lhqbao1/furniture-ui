'use client'
import CustomBreadCrumb from '@/components/shared/breadcrumb'
import ProductsGridLayout from '@/components/shared/products-grid-layout'
import { SlidersHorizontal } from 'lucide-react'
import { useParams, usePathname } from 'next/navigation'
import React, { useState } from 'react'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import FilterSection from '@/components/layout/single-product/filter-section'
import { ProductGridSkeleton } from '@/components/shared/product-grid-skeleton'
import { CustomPagination } from '@/components/shared/custom-pagination'
import { useAtom } from 'jotai'
import { currentCategoryIdAtom, currentCategoryNameAtom } from '@/store/category'
import { useTranslations } from 'next-intl'
import { CategoryBySlugResponse } from '@/types/categories'
import { useQuery } from '@tanstack/react-query'
import { getCategoryBySlug } from '@/features/category/api'

interface ProductCategoryProps {
    categorySlugs: string[]
    tag?: string
    category?: CategoryBySlugResponse
}

const ProductCategory = ({ categorySlugs, tag, category }: ProductCategoryProps) => {
    const t = useTranslations()
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(16)
    const [currentCategoryName, setCurrentCategoryName] = useAtom(currentCategoryNameAtom)

    const { data: categoryData, isFetching } = useQuery({
        queryKey: ['category', categorySlugs, page, pageSize],
        queryFn: () => getCategoryBySlug(categorySlugs[categorySlugs.length - 1], { page, page_size: pageSize }),
        initialData: category, // 👈 lấy từ server render lần đầu
    })

    return (
        <div className='pt-3 xl:pb-16 pb-6'>
            <CustomBreadCrumb currentPage={category?.name ?? ''} />
            <div className=''>
                <h2 className='section-header'>{category?.name}</h2>
                <p className='text-center text-xl font-bold mt-2'>{category?.products.length === 0 ? t('emptyCategory') : ''}</p>
                {!categoryData || isFetching ?
                    <ProductGridSkeleton length={12} /> :
                    <div className='filter-section'>
                        {/* {
                            categoryData.products.length > 0 &&
                            <Collapsible>
                                <CollapsibleTrigger asChild>
                                    <div className='flex justify-end cursor-pointer mb-2 lg:mr-30'>
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
                        } */}
                        <div className='pt-10 pb-12'>
                            <ProductsGridLayout hasBadge data={categoryData.products} />
                        </div>
                    </div>
                }
            </div>
            {categoryData && categoryData.products.length > 16 &&
                <CustomPagination totalPages={categoryData.total_pages} page={page} onPageChange={(newPage) => setPage(newPage)} />
            }
        </div >
    )
}

export default ProductCategory