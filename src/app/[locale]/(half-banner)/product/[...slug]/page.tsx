import { getAllProducts, getProductById, getProductsFeed } from '@/features/products/api'
import type { Metadata } from 'next'
import { StaticFile } from '@/types/products'
import { getProductGroupDetail } from '@/features/product-group/api'
import ProductDetails from '@/components/layout/single-product/product-details'

interface PageProps {
    params: Promise<{ slug: string[] }>
}

// 🕒 ISR: tái tạo lại mỗi 1 giờ (3600s)
export const revalidate = 3600

// 🏗️ Tạo trước các trang sản phẩm khi build
export async function generateStaticParams() {
    const products = await getProductsFeed()
    return products.map((p) => ({
        slug: [p.id], // hoặc [p.slug] nếu bạn dùng slug thật
    }))
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
            robots: { index: true, follow: true },
            openGraph: {
                title: product?.meta_title || product?.name,
                description: product?.meta_description || product?.description?.slice(0, 150),
                images: product?.static_files?.map((img: StaticFile) => ({ url: img.url })) ?? [],
            },
            alternates: { canonical: product?.id || `https://www.prestige-home.de/product/${product.id}` },
        }
    } catch {
        return {
            title: 'Not found',
            description: 'This page is not available',
            robots: { index: false, follow: false },
        };
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
