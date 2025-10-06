import { getProductById } from '@/features/products/api'
import type { Metadata } from 'next'
import { StaticFile } from '@/types/products'
import { getProductGroupDetail } from '@/features/product-group/api'
import ProductDetails from '@/components/layout/single-product/product-details'

interface PageProps {
    params: Promise<{ slug: string[] }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const slugArray = Array.isArray(slug) ? slug : [slug]
    const lastSlug = slugArray[slugArray.length - 1]


    try {
        const product = await getProductById(lastSlug)
        return {
            title: product?.meta_title || product?.name,
            description: product?.meta_description || product?.description?.slice(0, 150),
            openGraph: {
                title: product?.meta_title || product?.name,
                description: product?.meta_description || product?.description?.slice(0, 150),
                images: product?.static_files?.map((img: StaticFile) => ({ url: img.url })) ?? [],
            },
        }
    } catch {
        return { title: 'Not found', description: 'This page is not available' }
    }
}

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
    const resolvedParams = await params;
    const slugArray = Array.isArray(resolvedParams.slug) ? resolvedParams.slug : [resolvedParams.slug]
    const lastSlug = slugArray[slugArray.length - 1]

    const product = await getProductById(lastSlug)
    let parentProduct = null
    if (product?.parent_id) {
        parentProduct = await getProductGroupDetail(product.parent_id)
    }
    return <ProductDetails parentProductData={parentProduct} productDetailsData={product} productId={lastSlug} />
}
