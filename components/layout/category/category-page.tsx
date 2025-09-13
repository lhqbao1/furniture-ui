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
    const params = useParams()
    const paramValues = Object.values(params)
    const pathname = usePathname()
    console.log(pathname)
    const [page, setPage] = useState(1)

    const slug = paramValues[paramValues.length - 1] as string
    const { data: category, isLoading, isError } = useGetCategoryByName(slugify(slug[0]))

    if (!category || isLoading) return <ProductGridSkeleton length={12} />

    // Nếu có tag, lọc sản phẩm
    // const filteredProducts = tag
    //     ? products.items.filter((product) => formatTag(product.tag ?? '') === tag)
    //     : products.items

    return (
        <div className='pt-3 xl:pb-16 pb-6'>
            <CustomBreadCrumb />
            <div className=''>
                <h2 className='section-header'>Wohnen</h2>
                {isLoading || isError || !category ?
                    <ProductGridSkeleton length={12} /> :
                    <div className='filter-section'>
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
                        <div className='pt-10 pb-12'>
                            <ProductsGridLayout hasBadge data={category} />
                        </div>
                    </div>
                }
            </div>
            <CustomPagination totalPages={category.length} page={page} onPageChange={setPage} />
        </div >
    )
}

export default ProductCategory