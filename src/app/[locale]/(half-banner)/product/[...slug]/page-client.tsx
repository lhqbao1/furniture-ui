// app/[locale]/products/[...slug]/page-client.tsx

import { getProductById } from '@/features/products/api'
import { getCategoryBySlug } from '@/features/category/api'
import ProductDetails from '@/components/layout/single-product/product-details'
import ProductCategory from '@/components/layout/category/category-page'

interface PageProps {
    params: { slug: string[] }
}

export const revalidate = 3600

export default async function CatchAllPage({ params }: PageProps) {
    const slugArray = Array.isArray(params.slug) ? params.slug : [params.slug]
    const lastSlug = slugArray[slugArray.length - 1]
    const validSlugArray = slugArray.filter((s): s is string => !!s)

    const isProduct = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(lastSlug ?? '')

    if (isProduct) {
        const product = await getProductById(lastSlug)
        return <ProductDetails productDetails={product} />
    } else {
        const category = await getCategoryBySlug(lastSlug)
        return <ProductCategory category={category} categorySlugs={validSlugArray} />
    }
}
