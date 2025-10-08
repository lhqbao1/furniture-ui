import { getAllProducts, getProductById, getProductsFeed } from '@/features/products/api'
import type { Metadata } from 'next'
import { StaticFile } from '@/types/products'
import { getProductGroupDetail } from '@/features/product-group/api'
import ProductDetails from '@/components/layout/single-product/product-details'

interface PageProps {
    params: Promise<{ slug: string[]; locale: string }>
}

// 🕒 ISR: tái tạo lại mỗi 1 giờ (3600s)
export const revalidate = 3600

// 🏗️ Pre-render sản phẩm (SSG + ISR)
export async function generateStaticParams() {
    const products = await getProductsFeed()
    const locales = ['de', 'en']

    // Tạo path cho mỗi locale
    return products.flatMap((p) =>
        locales.map((locale) => ({
            locale,
            slug: [p.id], // Nếu có slug riêng, đổi thành [p.slug]
        }))
    )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug, locale } = await params;
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
                url: `https://www.prestige-home.de/${locale}/product/${product.id}`,
                images: product?.static_files?.map((img: StaticFile) => ({ url: img.url })) ?? [],
            },
            alternates: {
                canonical: `https://www.prestige-home.de/${locale}/product/${product.id}`,
                languages: {
                    de: `https://www.prestige-home.de/de/product/${product.id}`,
                    en: `https://www.prestige-home.de/en/product/${product.id}`,
                    'x-default': `https://www.prestige-home.de/en/product/${product.id}`,
                },
            },
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
