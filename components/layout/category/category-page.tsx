'use client'
import CustomBreadCrumb from '@/components/shared/breadcrumb'
import ProductsGridLayout from '@/components/shared/products-grid-layout'
import { SlidersHorizontal } from 'lucide-react'
import { useParams, usePathname } from 'next/navigation'
import React, { useState } from 'react'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import FilterSection from '@/components/layout/single-product/filter-section'
import { ProductGridSkeleton } from '@/components/shared/product-grid-skeleton'
import { useGetCategoryByName } from '@/features/category/hook'
import { slugify } from '@/lib/slugify'
import { CustomPagination } from '@/components/shared/custom-pagination'
import { useAtom } from 'jotai'
import { currentCategoryIdAtom, currentCategoryNameAtom } from '@/store/category'
import { useQuery } from '@tanstack/react-query'
import { getCategoryById } from '@/features/category/api'
import { useTranslations } from 'next-intl'

interface ProductCategoryProps {
    categorySlugs: string[]
    tag?: string
}

function formatTag(slug: string) {
    return slug
        .split('-')                // ["best", "seller"]
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // ["Best", "Seller"]
        .join(' ')                  // "Best Seller"
}

const ProductCategory = ({ categorySlugs, tag }: ProductCategoryProps) => {
    const t = useTranslations()
    const params = useParams()
    const paramValues = Object.values(params)
    const [page, setPage] = useState(1)
    const [currentCategoryId, setCurrentCategoryId] = useAtom(currentCategoryIdAtom)
    const [currentCategoryName, setCurrentCategoryName] = useAtom(currentCategoryNameAtom)

    const slug = paramValues[paramValues.length - 1] as string
    const { data: category, isLoading, isError } = useQuery({
        queryKey: ["category", currentCategoryId],
        queryFn: () => getCategoryById(currentCategoryId ?? ''),
        enabled: !!currentCategoryId,
        retry: false,
    });

    if (!category || isLoading) return <ProductGridSkeleton length={12} />

    // Nếu có tag, lọc sản phẩm
    // const filteredProducts = tag
    //     ? products.items.filter((product) => formatTag(product.tag ?? '') === tag)
    //     : products.items

    return (
        <div className='pt-3 xl:pb-16 pb-6'>
            <CustomBreadCrumb currentPage={currentCategoryName ?? ''} />
            <div className=''>
                <h2 className='section-header'>{currentCategoryName}</h2>
                <p className='text-center text-xl font-bold mt-2'>{category.in_category.length === 0 ? t('emptyCategory') : ''}</p>
                {isLoading || isError || !category ?
                    <ProductGridSkeleton length={12} /> :
                    <div className='filter-section'>
                        {
                            category.in_category.length > 0 &&
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
                        }
                        <div className='pt-10 pb-12'>
                            <ProductsGridLayout hasBadge data={category.in_category} />
                        </div>
                    </div>
                }
            </div>
            {/* {category.in_category.length > 0 &&
                <CustomPagination totalPages={category.in_category.length / 2} page={page} onPageChange={(newPage) => setPage(newPage)} />
            } */}
        </div >
    )
}

export default ProductCategory