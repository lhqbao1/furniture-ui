import BlogBreadcrumb from "@/components/layout/blog/blog-breadcrumb";
import BlogListClient from "@/components/layout/blog/blog-list-client";
import SidebarBlog from "@/components/layout/blog/blog-sidebar";
import FeaturedPost from "@/components/layout/blog/featured-post";
import { getBlogsByProduct, getBlogsByProductSlug } from "@/features/blog/api";
import { getProductBySlug } from "@/features/products/api";
import { BlogItem } from "@/types/blog";
import type { Metadata } from "next";

/* PPR */
export const experimental_ppr = true;
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

/* -------- Metadata cho Category Blog ---------- */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const productId = slug[0];

  return {
    title: `Blog Kategorie`,
    description: "Entdecken Sie themenbezogene Artikel und Ratgeber.",
    openGraph: {
      title: "Blog Kategorie",
      description: "Alle Blogbeiträge zu diesem Produkt.",
      url: `https://www.prestige-home.de/de/blog/category/${productId}`,
    },
  };
}

/* -------- PAGE ---------- */
export default async function BlogCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const productSlug = slug[0];

  // Lấy blog theo productId (API mới bạn yêu cầu)
  const categoryBlogs = await getBlogsByProductSlug({
    product_slug: productSlug,
    page: 1,
    page_size: 16,
  });

  const productDetails = await getProductBySlug(productSlug);

  // Sidebar vẫn lấy tất cả blog theo product
  const sidebarData = await getBlogsByProduct();

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
    name: "Blog Kategorie – Prestige Home",
    url: `https://www.prestige-home.de/de/blog/category/${productSlug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: categoryBlogs.items.map((post: BlogItem) => ({
        "@type": "BlogPosting",
        headline: post.title,
        url: `https://www.prestige-home.de/de/blog/${post.title}`,
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
        name: "Blog Category",
        item: `https://www.prestige-home.de/de/blog/category/${productSlug}`,
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
        <h1 className="text-center !text-3xl">{productDetails?.name}</h1>
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
              title: productDetails?.name ?? "",
            }}
          />
        </div>
      </div>

      <div className="w-10/12 mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 xl:gap-12 2xl:gap-20">
          {/* MAIN */}
          <div className="lg:col-span-8 space-y-20">
            {featured && <FeaturedPost post={featured} />}

            <BlogListClient initialData={listData} />
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
