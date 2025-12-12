import BlogBreadcrumb from "@/components/layout/blog/blog-breadcrumb";
import BlogListClient from "@/components/layout/blog/blog-list-client";
import SidebarBlog from "@/components/layout/blog/blog-sidebar";
import FeaturedPost from "@/components/layout/blog/featured-post";
import CustomBreadCrumb from "@/components/shared/breadcrumb";
import { getBlogs, getBlogsByProduct } from "@/features/blog/api";
import { BlogItem } from "@/types/blog";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";

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
  // Chạy song song để nhanh hơn
  const mainData = await getBlogs();
  const sideBarData = await getBlogsByProduct();

  const featured = mainData.items[0];
  const others = mainData.items.slice(1);

  /* Schema.org */
  const schema = {
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
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

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
            <FeaturedPost post={featured} />
            <BlogListClient
              initialPosts={others}
              initialPagination={mainData.pagination}
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
