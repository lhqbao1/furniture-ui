import BlogBreadcrumb from "@/components/layout/blog/blog-breadcrumb";
import BlogListClient from "@/components/layout/blog/blog-list-client";
import SidebarBlog from "@/components/layout/blog/blog-sidebar";
import FeaturedPost from "@/components/layout/blog/featured-post";
import { getBlogsByProduct, getBlogsByProductSlug } from "@/features/blog/api";
import { getProductBySlug } from "@/features/products/api";
import { BlogByProductResponse, BlogItem, BlogsResponse } from "@/types/blog";
import type { Metadata } from "next";

/* PPR */
export const experimental_ppr = true;
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

const EMPTY_BLOGS_RESPONSE: BlogsResponse = {
  pagination: {
    page: 1,
    page_size: 16,
    total_items: 0,
    total_pages: 1,
  },
  items: [],
};

const EMPTY_BLOG_BY_PRODUCT_RESPONSE: BlogByProductResponse = {
  products: [],
  pagination_product: {
    page: 1,
    page_size: 5,
    total_items: 0,
    total_pages: 1,
  },
};

function humanizeSlug(value: string): string {
  try {
    return decodeURIComponent(value).replace(/-/g, " ").trim();
  } catch {
    return value.replace(/-/g, " ").trim();
  }
}

function getSafePostUrl(post: BlogItem): string {
  if (typeof post.slug === "string" && post.slug.trim().length > 0) {
    return `https://www.prestige-home.de/de/blog/${post.slug}`;
  }
  return "https://www.prestige-home.de/de/blog";
}

/* -------- Metadata cho Category Blog ---------- */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const productSlug =
    typeof slug?.[0] === "string" && slug[0].trim().length > 0
      ? slug[0]
      : "";

  const fallbackName = productSlug ? humanizeSlug(productSlug) : "Produkt";
  const categoryUrl = productSlug
    ? `https://www.prestige-home.de/de/blog/category/${productSlug}`
    : "https://www.prestige-home.de/de/blog";

  let productName = fallbackName;
  if (productSlug) {
    try {
      const productDetails = await getProductBySlug(productSlug);
      if (productDetails?.name?.trim()) {
        productName = productDetails.name.trim();
      }
    } catch {
      // keep fallbackName
    }
  }

  const title = `${productName} Blog Kategorie`;

  return {
    title,
    description: `Entdecken Sie themenbezogene Artikel und Ratgeber zu ${productName}.`,
    alternates: {
      canonical: categoryUrl,
    },
    openGraph: {
      title,
      description: `Alle Blogbeiträge zu ${productName}.`,
      url: categoryUrl,
    },
  };
}

/* -------- PAGE ---------- */
export default async function BlogCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const productSlug =
    typeof slug?.[0] === "string" && slug[0].trim().length > 0
      ? slug[0]
      : "";
  const fallbackName = productSlug ? humanizeSlug(productSlug) : "Produkt";
  const categoryUrl = productSlug
    ? `https://www.prestige-home.de/de/blog/category/${productSlug}`
    : "https://www.prestige-home.de/de/blog";

  const [categoryBlogsResult, productDetailsResult, sidebarResult] =
    await Promise.allSettled([
      productSlug
        ? getBlogsByProductSlug({
            product_slug: productSlug,
            page: 1,
            page_size: 16,
          })
        : Promise.resolve(EMPTY_BLOGS_RESPONSE),
      productSlug ? getProductBySlug(productSlug) : Promise.resolve(null),
      getBlogsByProduct({ is_econelo: false }),
    ]);

  const categoryBlogs =
    categoryBlogsResult.status === "fulfilled" &&
    categoryBlogsResult.value &&
    Array.isArray(categoryBlogsResult.value.items)
      ? categoryBlogsResult.value
      : EMPTY_BLOGS_RESPONSE;

  const productDetails =
    productDetailsResult.status === "fulfilled"
      ? productDetailsResult.value
      : null;

  const sidebarData =
    sidebarResult.status === "fulfilled" &&
    sidebarResult.value &&
    Array.isArray(sidebarResult.value.products)
      ? sidebarResult.value
      : EMPTY_BLOG_BY_PRODUCT_RESPONSE;

  const productDisplayName =
    typeof productDetails?.name === "string" && productDetails.name.trim()
      ? productDetails.name.trim()
      : fallbackName;

  const featured = categoryBlogs.items[0];
  const listData = {
    pages: [
      {
        ...categoryBlogs,
        items: categoryBlogs.items.slice(1), // bỏ featured
      },
    ],
    pageParams: [1],
  };

  /* SCHEMA: CollectionPage + ItemList */
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${productDisplayName} Blog Kategorie – Prestige Home`,
    url: categoryUrl,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: categoryBlogs.items.map((post: BlogItem) => ({
        "@type": "BlogPosting",
        headline: post.title || "Blogbeitrag",
        url: getSafePostUrl(post),
        datePublished: post.created_at,
        author: { "@type": "Person", name: "Prestige Home" },
      })),
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
        name: productDisplayName,
        item: categoryUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([schema, breadcrumbSchema]),
        }}
      />

      <div className="bg-gray-50 min-h-[300px] flex items-center justify-center flex-col">
        <h1 className="text-center !text-3xl">{productDisplayName}</h1>
        <p className="text-secondary">
          {categoryBlogs.pagination.total_items} Beiträge
        </p>
        <div className="mt-4">
          <BlogBreadcrumb
            parentPage={{
              link: "/blog",
              title: "Blog",
            }}
            currentPage={{
              link: productSlug,
              title: productDisplayName,
            }}
          />
        </div>
      </div>

      <div className="w-10/12 mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 xl:gap-12 2xl:gap-20">
          {/* MAIN */}
          <div className="lg:col-span-8 space-y-20">
            {featured && <FeaturedPost post={featured} />}

            <BlogListClient
              initialData={listData}
              productSlug={productSlug}
            />
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4">
            <SidebarBlog items={sidebarData} />
          </aside>
        </div>
      </div>
    </>
  );
}
