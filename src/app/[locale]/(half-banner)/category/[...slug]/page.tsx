import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCategoryBySlug } from "@/features/category/api"
import ProductCategory from "@/components/layout/category/category-page"

interface PageProps {
    params: Promise<{ slug: string[] }>
}
export const revalidate = 3600

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const slugArray = Array.isArray(slug) ? slug : [slug]
    const lastSlug = slugArray[slugArray.length - 1]

    try {
        const category = await getCategoryBySlug(lastSlug)
        return {
            title: category?.meta_title || "Prestige Home",
            robots: { index: true, follow: true },
            description:
                category?.meta_description ||
                "Category",
            // openGraph: {
            //     title: category?.meta_title || category?.name,
            //     description:
            //         category?.meta_description ||
            //         category?.description?.slice(0, 150),
            // },
        }
    } catch {
        return {
            title: 'Not found',
            description: 'This page is not available',
            robots: { index: false, follow: false },
        };
    }
}

export default async function Page({ params }: PageProps) {
    const resolvedParams = await params;
    const slugArray = Array.isArray(resolvedParams.slug) ? resolvedParams.slug : [resolvedParams.slug]
    const lastSlug = slugArray[slugArray.length - 1]

    const category = await getCategoryBySlug(lastSlug).catch(() => null)
    if (!category) return notFound()

    return <ProductCategory category={category} categorySlugs={slugArray} />
}

