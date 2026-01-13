import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/features/category/api";
import ProductCategory from "@/components/layout/category/category-page";
import { getCategoryCached } from "@/features/category/api-server";
import ShopAllFilterSection from "@/components/layout/shop-all/shop-all-filter-section";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}
export const revalidate = 3600;
export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugArray = Array.isArray(slug) ? slug : [slug];
  const lastSlug = slugArray[slugArray.length - 1];

  try {
    const category = await getCategoryCached(lastSlug);

    if (!category) throw new Error("Not found");

    // ✅ Tạo dữ liệu Schema.org cho Category Page
    const categorySchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: category.meta_title || category.name,
      description: category.meta_description || "",
      url: `https://www.prestige-home.de/de/category/${category}`,
      inLanguage: "de",
      isPartOf: {
        "@type": "WebSite",
        name: "Prestige Home",
        url: "https://www.prestige-home.de",
      },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.prestige-home.de/de",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: category.name,
            item: `https://www.prestige-home.de/de/category/${category.slug}`,
          },
        ],
      },
      // ✅ Optional: Liệt kê danh sách sản phẩm nếu API có trả về
      mainEntity: {
        "@type": "ItemList",
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        name: category.name,
        numberOfItems: category.products?.length || 0,
        itemListElement:
          category.products?.slice(0, 10).map((p, index) => ({
            "@type": "Product",
            position: index + 1,
            name: p.name,
            image:
              p.static_files?.[0]?.url ||
              "https://pxjiuyvomonmptmmkglv.supabase.co/storage/v1/object/public/erp/uploads/482eb0ac-4c04-4439-9729-c6725ba9530f_product-placeholder.png",
            url: `https://www.prestige-home.de/de/product/${p.url_key}`,
            offers: {
              "@type": "Offer",
              priceCurrency: "EUR",
              price: p.final_price ?? p.price,
              availability:
                p.stock > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
            },
          })) || [],
      },
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.prestige-home.de/de",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: category.name,
          item: `https://www.prestige-home.de/de/category/${category.slug}`,
        },
      ],
    };

    return {
      title: category.meta_title || category.name,
      description: category.meta_description || "",
      robots: { index: true, follow: true },
      alternates: {
        canonical: `https://www.prestige-home.de/de/category/${category.slug}`,
      },
      openGraph: {
        title: category.meta_title || category.name,
        description: category.meta_description,
        url: `https://www.prestige-home.de/de/category/${category.slug}`,
        images: category.img_url ?? "",
      },
      other: {
        "application/ld+json": JSON.stringify([
          categorySchema,
          breadcrumbSchema,
        ]),
      },
    };
  } catch {
    return {
      title: "Not found",
      description: "This page is not available",
      robots: { index: false, follow: false },
    };
  }
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const slugArray = Array.isArray(resolvedParams.slug)
    ? resolvedParams.slug
    : [resolvedParams.slug];
  const lastSlug = slugArray[slugArray.length - 1];

  const category = await getCategoryCached(lastSlug);
  if (!category) return notFound();

  return (
    <ProductCategory
      category={category}
      categorySlugs={slugArray}
    />
  );
}
