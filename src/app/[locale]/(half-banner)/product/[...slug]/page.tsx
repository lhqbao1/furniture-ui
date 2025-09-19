// app/[locale]/products/[...slug]/page.tsx
import { getProductById } from '@/features/products/api'
import type { Metadata } from 'next'
import CatchAllPage from './page-client'
import { StaticFile } from '@/types/products'

// 👇 generateMetadata chạy server-side
export async function generateMetadata({ params }: { params: { slug: string[] } }): Promise<Metadata> {
    const { slug } = await params; // 👈 phải await

    const slugArray = Array.isArray(slug) ? slug : [slug];
    const lastSlug = slugArray[slugArray.length - 1];

    const isProduct = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(lastSlug ?? '')

    if (!isProduct) {
        // ❌ Không có API category → bỏ qua
        return {}
    }

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
        return { title: 'Product not found', description: 'This product is not available' }
    }
}

// 👇 export UI (client component)
export default function Page() {
    return <CatchAllPage />
}
