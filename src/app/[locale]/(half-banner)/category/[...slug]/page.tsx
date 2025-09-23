import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCategoryBySlug } from "@/features/category/api"
import ProductCategory from "@/components/layout/category/category-page"

interface PageProps {
    params: { slug: string[] }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const slugArray = params.slug ?? []
    const lastSlug = slugArray.at(-1) ?? ""

    try {
        const category = await getCategoryBySlug(lastSlug)
        return {
            // title: category?.meta_title || category?.name || "Prestige Home",
            // description:
            //     category?.meta_description ||
            //     category?.description?.slice(0, 150) ||
            //     "Danh mục sản phẩm",
            // openGraph: {
            //     title: category?.meta_title || category?.name,
            //     description:
            //         category?.meta_description ||
            //         category?.description?.slice(0, 150),
            // },
        }
    } catch {
        return {
            title: "Not found",
            description: "This page is not available",
        }
    }
}

export default async function Page({ params }: PageProps) {
    const slugArray = params.slug ?? []
    const lastSlug = slugArray.at(-1) ?? ""

    const category = await getCategoryBySlug(lastSlug).catch(() => null)
    if (!category) return notFound()

    return <ProductCategory category={category} categorySlugs={slugArray} />
}

export const revalidate = 3600
