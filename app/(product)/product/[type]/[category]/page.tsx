'use client'
import CustomBreadCrumb from '@/components/shared/breadcrumb'
import ColorPickerButton from '@/components/shared/color-picker-button'
import ImageSinglePicker, { SizeType } from '@/components/shared/image-single-picker'
import MaterialPicker from '@/components/shared/image-single-picker'
import ProductsGridLayout from '@/components/shared/products-grid-layout'
import RangePicker from '@/components/shared/range-picker'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { colors, materials, tags, trendingProducts } from '@/data/data'
import { SlidersHorizontal } from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import FilterSection from '@/components/layout/single-product/filter-section'
import { CustomPagination } from '@/components/shared/custom-pagination'

const ProductCategory = () => {
    const params = useParams()
    const paramValues = Object.values(params)
    const category = paramValues[paramValues.length - 1]

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
                        <ProductsGridLayout hasBadge data={trendingProducts} />
                    </div>

                </div>
            </div>
            {/* <CustomPagination /> */}
        </div >
    )
}

export default ProductCategory