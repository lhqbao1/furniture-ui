import BlogBreadcrumb from "@/components/layout/blog/blog-breadcrumb";
import BlogListClient from "@/components/layout/blog/blog-list-client";
import SidebarBlog from "@/components/layout/blog/blog-sidebar";
import FeaturedPost from "@/components/layout/blog/featured-post";
import { getBlogs, getBlogsByProduct } from "@/features/blog/api";
import { safeRequest } from "@/lib/safe-fetch-server";
import { BlogItem } from "@/types/blog";
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";

/* PPR */
export const experimental_ppr = true;
export const revalidate = 3600;

/* Metadata */
export const metadata: Metadata = {
  title: "Blog",
  description:
    "Entdecken Sie Artikel über Wohndesign, Einrichtungsideen und Lifestyle-Tipps.",
  openGraph: {
    title: "Blog",
    description:
      "Inspirierende Beiträge über Wohndesign, Einrichtung und Lifestyle.",
    url: "https://www.prestige-home.de/de/blog",
  },
};

export default async function BlogPage() {
  const getMainBlogsCached = unstable_cache(
    async () =>
      safeRequest(getBlogs({ pageSize: 16 }), {
        items: [],
        pagination: {
          page: 1,
          page_size: 16,
          total_items: 0,
          total_pages: 0,
        },
      }),
    ["blog-main", "page-size-16"],
    { revalidate: 600 },
  );

  const getSidebarBlogsCached = unstable_cache(
    async () => safeRequest(getBlogsByProduct(), []),
    ["blog-sidebar-products"],
    { revalidate: 600 },
  );

  const [mainData, sideBarData] = await Promise.all([
    getMainBlogsCached(),
    getSidebarBlogsCached(),
  ]);

  const featured = mainData.items.length > 0 ? mainData.items[0] : null;

  const listData = {
    ...mainData,
    items: mainData.items.length > 1 ? mainData.items.slice(1) : [],
  };

  /* Schema.org */
  const schema =
    mainData.items.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Prestige Home Blog",
          url: "https://www.prestige-home.de/de/blog",
          blogPost: mainData.items.map((post: BlogItem) => ({
            "@type": "BlogPosting",
            headline: post.title,
            //   image: post.image,
            url: `https://www.prestige-home.de/de/blog/${post.title}`,
            datePublished: post.created_at,
            author: { "@type": "Person", name: "Prestige Home" },
          })),
        }
      : null;

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}

      <div className="w-10/12 mx-auto px-4 pb-16 pt-8">
        <BlogBreadcrumb
          currentPage={{
            link: "/blog",
            title: "Blog",
          }}
        />
        <div className="grid grid-cols-1 lg:grid-cols-12 xl:gap-12 2xl:gap-20">
          {/* MAIN COLUMN */}
          <div className="lg:col-span-8 space-y-20">
            {featured && <FeaturedPost post={featured} />}
            <BlogListClient
              initialData={{
                pages: [listData],
                pageParams: [1],
              }}
            />
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4">
            <SidebarBlog items={sideBarData} />
          </aside>
        </div>
      </div>
    </>
  );
}
