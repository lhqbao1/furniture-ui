'use client'

import { useParams } from 'next/navigation'
import ProductDetails from '@/components/layout/single-product/product-details'
import ProductCategory from '@/components/layout/category/category-page'

export default function CatchAllPage() {
    const params = useParams()
    const slugArray = Array.isArray(params.slug) ? params.slug : [params.slug]
    const lastSlug = slugArray[slugArray.length - 1]
    const validSlugArray = slugArray.filter((s): s is string => !!s) // chỉ lấy string


    // Kiểm tra xem slug cuối có phải UUID không
    const isProduct = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(lastSlug ?? '')

    if (isProduct) {
        return <ProductDetails />
    } else {
        return <ProductCategory categorySlugs={validSlugArray} />
    }
}
