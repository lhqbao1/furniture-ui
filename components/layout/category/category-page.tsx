'use client'
import CustomBreadCrumb from '@/components/shared/breadcrumb'
import ProductsGridLayout from '@/components/shared/products-grid-layout'
import { SlidersHorizontal } from 'lucide-react'
import { useParams } from 'next/navigation'
import React from 'react'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import FilterSection from '@/components/layout/single-product/filter-section'
import { useGetAllProducts } from '@/features/products/hook'
import { ProductGridSkeleton } from '@/components/shared/product-grid-skeleton'

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
    const slug = paramValues[paramValues.length - 1]
    const category = slug && slug[paramValues.length]


    const { data: products, isLoading, isError } = useGetAllProducts()

    if (!products || isLoading) return <ProductGridSkeleton length={12} />

    // Nếu có tag, lọc sản phẩm
    const filteredProducts = tag
        ? products.items.filter((product) => formatTag(product.tag ?? '') === tag)
        : products.items

    return (
        <div className='pt-3 xl:pb-16 pb-6'>
            <CustomBreadCrumb />
            <div className=''>
                <h2 className='text-center text-3xl font-bold capitalize text-secondary'>{category}</h2>
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
                        <div className='pt-10 pb-12'>
                            <ProductsGridLayout hasBadge data={filteredProducts} />
                        </div>
                    </div>
                }
            </div>
            {/* <CustomPagination /> */}
        </div >
    )
}

export default ProductCategory