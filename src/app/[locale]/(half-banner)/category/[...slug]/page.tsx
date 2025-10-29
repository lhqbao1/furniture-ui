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

        if (!category) throw new Error("Not found")

        // ✅ Tạo dữ liệu Schema.org cho Category Page
        const categorySchema = {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": category.meta_title || category.name,
            "description": category.meta_description || "",
            "url": `https://www.prestige-home.de/de/category/${category}`,
            "inLanguage": "de",
            "isPartOf": {
                "@type": "WebSite",
                "name": "Prestige Home",
                "url": "https://www.prestige-home.de"
            },
            "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": "https://www.prestige-home.de/de"
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": category.name,
                        "item": `https://www.prestige-home.de/de/category/${category.slug}`
                    }
                ]
            },
            // ✅ Optional: Liệt kê danh sách sản phẩm nếu API có trả về
            "mainEntity": {
                "@type": "ItemList",
                "itemListOrder": "https://schema.org/ItemListOrderAscending",
                "name": category.name,
                "numberOfItems": category.products?.length || 0,
                "itemListElement": category.products?.slice(0, 10).map((p, index) => ({
                    "@type": "Product",
                    "position": index + 1,
                    "name": p.name,
                    "image": p.static_files?.[0]?.url || "https://www.prestige-home.de/placeholder.webp",
                    "url": `https://www.prestige-home.de/de/product/${p.url_key}`,
                    "offers": {
                        "@type": "Offer",
                        "priceCurrency": "EUR",
                        "price": p.final_price ?? p.price,
                        "availability": p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                    }
                })) || []
            }
        }

        return {
            title: category.meta_title || category.name,
            description:
                category.meta_description || "",
            robots: { index: true, follow: true },
            alternates: {
                canonical: `https://www.prestige-home.de/de/category/${category.slug}`,
            },
            openGraph: {
                title: category.meta_title || category.name,
                description:
                    category.meta_description,
                url: `https://www.prestige-home.de/de/category/${category.slug}`,
                images:
                    category.img_url ?? '',
            },
            other: {
                "application/ld+json": JSON.stringify(categorySchema),
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


export default async function Page({ params }: PageProps) {
    const resolvedParams = await params;
    const slugArray = Array.isArray(resolvedParams.slug) ? resolvedParams.slug : [resolvedParams.slug]
    const lastSlug = slugArray[slugArray.length - 1]

    const category = await getCategoryBySlug(lastSlug).catch(() => null)
    if (!category) return notFound()

    return <ProductCategory category={category} categorySlugs={slugArray} />
}

