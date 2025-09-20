// app/[locale]/products/[...slug]/page.tsx
import { getProductById } from '@/features/products/api'
import type { Metadata } from 'next'
import CatchAllPage from './page-client'
import { StaticFile } from '@/types/products'
import { getCategoryBySlug } from '@/features/category/api'

interface PageProps {
    params: Promise<{ slug: string[] }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const slugArray = Array.isArray(slug) ? slug : [slug]
    const lastSlug = slugArray[slugArray.length - 1]

    const isProduct = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(lastSlug ?? '')

    try {
        if (isProduct) {
            // 🟢 Product page
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
        } else {
            // 🟢 Category page
            const category = await getCategoryBySlug(lastSlug)
            return {
                // title: category?.meta_title || category?.name,
                // description: category?.meta_description || category?.description?.slice(0, 150),
                // openGraph: {
                //     title: category?.meta_title || category?.name,
                //     description: category?.meta_description || category?.description?.slice(0, 150),
                // },
            }
        }
    } catch {
        return { title: 'Not found', description: 'This page is not available' }
    }
}

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
    const resolvedParams = await params;
    return <CatchAllPage params={resolvedParams} />
}
