'use client'
import CustomBreadCrumb from '@/components/shared/breadcrumb'
import ProductsGridLayout from '@/components/shared/products-grid-layout'
import { trendingProducts } from '@/data/data'
import { SlidersHorizontal } from 'lucide-react'
import { useParams } from 'next/navigation'
import React from 'react'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import FilterSection from '@/components/layout/single-product/filter-section'
import { useGetAllProducts } from '@/features/products/hook'

const ProductCategory = () => {
    const params = useParams()
    const paramValues = Object.values(params)
    const category = paramValues[paramValues.length - 1]

    const { data: products, isLoading, isError } = useGetAllProducts()
    if (isLoading) return <div>Loading...</div>
    if (isError) return <div className="text-red-500">❌ Failed to load products.</div>
    if (!products) return <div className="text-red-500">No products found.</div>


    return (
        <div className='pt-3 xl:pb-16 pb-6'>
            <CustomBreadCrumb />
            <div className=''>
                <h2 className='text-center text-3xl font-bold capitalize text-secondary'>{category}</h2>
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

                    {/*Filter section */}


                    {/*Products section */}
                    <div className='pt-10 pb-12'>
                        <ProductsGridLayout hasBadge data={products} />
                    </div>

                </div>
            </div>
            {/* <CustomPagination /> */}
        </div >
    )
}

export default ProductCategory