import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SidebarBlog from "@/components/layout/blog/blog-sidebar";
import BlogDetails from "@/components/layout/blog/blog-details";
import { getBlogDetailsBySlug, getBlogsByProduct } from "@/features/blog/api";
import { unstable_cache } from "next/cache";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

/* --------------------------------------------------------
 * ENABLE PARTIAL PRERENDERING
 * ------------------------------------------------------*/
export const experimental_ppr = true;
export const revalidate = 3600;
export const dynamicParams = true;

const getBlogDetailCached = (slug: string) =>
  unstable_cache(() => getBlogDetailsBySlug(slug), ["blog-detail", slug], {
    revalidate: 600,
  })();

const getSidebarBlogsCached = unstable_cache(
  () => getBlogsByProduct(),
  ["blog-sidebar-products"],
  { revalidate: 600 },
);

/* --------------------------------------------------------
 * 2) GENERATE METADATA
 * ------------------------------------------------------*/
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const lastSlug = slug[0];

  let post = await getBlogDetailCached(lastSlug);
  if (!post) {
    post = await getBlogDetailsBySlug(lastSlug);
  }
  if (!post) return {};

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    // image: post.image,
    datePublished: post.created_at,
    author: {
      "@type": "Person",
      name: "Prestige Home Redaktion",
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
        name: post.title,
        item: `https://www.prestige-home.de/de/blog/${post.slug}`,
      },
    ],
  };

  return {
    title: post.title,
    description: post.content?.slice(0, 150),
    openGraph: {
      title: post.title,
      description: post.content,
      url: `https://www.prestige-home.de/de/blog/${post.slug}`,
    },
    other: {
      "application/ld+json": JSON.stringify([schema, breadcrumbSchema]),
    },
  };
}

/* --------------------------------------------------------
 * 3) PAGE
 * ------------------------------------------------------*/
export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const blogSlug = slug[0];

  let [post, sidebarData] = await Promise.all([
    getBlogDetailCached(blogSlug),
    getSidebarBlogsCached(),
  ]);

  if (!post) {
    post = await getBlogDetailsBySlug(blogSlug);
  }
  if (!post) return notFound();

  if (!sidebarData || sidebarData.length === 0) {
    sidebarData = await getBlogsByProduct().catch(() => []);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* MAIN CONTENT (9 columns) */}
        <div className="lg:col-span-9">
          <BlogDetails post={post} />
        </div>

        {/* SIDEBAR (3 columns) */}
        <aside className="lg:col-span-3">
          <SidebarBlog items={sidebarData} />
        </aside>
      </div>
    </div>
  );
}
