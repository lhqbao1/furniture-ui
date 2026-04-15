import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SidebarBlog from "@/components/layout/blog/blog-sidebar";
import BlogDetails from "@/components/layout/blog/blog-details";
import { getBlogDetailsBySlug, getBlogsByProduct } from "@/features/blog/api";
import { unstable_cache } from "next/cache";
import { BlogByProductResponse } from "@/types/blog";

interface PageProps {
  params: Promise<{ slug: string[]; locale?: string }>;
}

/* --------------------------------------------------------
 * ENABLE PARTIAL PRERENDERING
 * ------------------------------------------------------*/
export const experimental_ppr = true;
export const revalidate = 3600;
export const dynamicParams = true;
const SITE_URL = "https://www.prestige-home.de";
const FALLBACK_DESCRIPTION = "Entdecken Sie den Blogbeitrag von Prestige Home.";
const FALLBACK_OG_IMAGE = `${SITE_URL}/blog-placeholder.png`;

const getBlogDetailCached = (slug: string) =>
  unstable_cache(() => getBlogDetailsBySlug(slug), ["blog-detail", slug], {
    revalidate: 600,
  })();

const getSidebarBlogsCached = unstable_cache(
  () => getBlogsByProduct({ is_econelo: undefined }),
  ["blog-sidebar-products"],
  { revalidate: 600 },
);

function normalizeLocale(locale?: string): string {
  const normalized = (locale ?? "de").trim().toLowerCase();
  return normalized || "de";
}

function toOgLocale(locale: string): string {
  if (locale === "de") return "de_DE";
  if (locale === "en") return "en_US";
  return locale;
}

function getFirstSlug(slug?: string[]): string {
  const first = Array.isArray(slug) ? slug[0] : "";
  return typeof first === "string" ? first.trim() : "";
}

function toMetaDescription(value?: string | null): string {
  if (!value) return FALLBACK_DESCRIPTION;
  const plainText = value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plainText.slice(0, 160) || FALLBACK_DESCRIPTION;
}

function toAbsoluteUrl(value?: string | null): string | null {
  if (!value?.trim()) return null;

  try {
    if (value.startsWith("//")) return `https:${value}`;
    return new URL(value, SITE_URL).toString();
  } catch {
    return null;
  }
}

function extractFirstImageFromContent(content?: string | null): string | null {
  if (!content) return null;

  const htmlImgMatch = content.match(
    /<img[^>]+src=["']([^"']+)["'][^>]*>/i,
  )?.[1];
  if (htmlImgMatch) return toAbsoluteUrl(htmlImgMatch);

  const markdownImgMatch = content.match(/!\[[^\]]*]\(([^)]+)\)/)?.[1];
  if (markdownImgMatch) return toAbsoluteUrl(markdownImgMatch);

  return null;
}

function toIsoDate(value?: string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function buildBlogUrl(locale: string, slug: string): string {
  return `${SITE_URL}/${locale}/blog/${encodeURIComponent(slug)}`;
}

function buildBlogSchemas(
  post: {
    title?: string | null;
    slug?: string | null;
    content?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  },
  locale: string,
) {
  const postSlug = post.slug?.trim();
  if (!postSlug) return null;

  const canonicalUrl = buildBlogUrl(locale, postSlug);
  const description = toMetaDescription(post.content);
  const imageUrl =
    extractFirstImageFromContent(post.content) ?? FALLBACK_OG_IMAGE;
  const datePublished = toIsoDate(post.created_at);
  const dateModified = toIsoDate(post.updated_at) ?? datePublished;

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title ?? "Blogbeitrag",
    description,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    datePublished,
    dateModified,
    image: [imageUrl],
    author: {
      "@type": "Organization",
      name: "Prestige Home Redaktion",
    },
    publisher: {
      "@type": "Organization",
      name: "Prestige Home",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo-icon.png`,
      },
    },
    inLanguage: locale,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Startseite",
        item: `${SITE_URL}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/${locale}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title ?? "Blogbeitrag",
        item: canonicalUrl,
      },
    ],
  };

  return [blogPostingSchema, breadcrumbSchema];
}

/* --------------------------------------------------------
 * 2) GENERATE METADATA
 * ------------------------------------------------------*/
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const lastSlug = getFirstSlug(slug);
  if (!lastSlug) return {};

  let post = await getBlogDetailCached(lastSlug);
  if (!post) {
    post = await getBlogDetailsBySlug(lastSlug);
  }
  if (!post) return {};

  const postSlug = post.slug?.trim() || lastSlug;
  const canonicalUrl = buildBlogUrl(locale, postSlug);
  const description = toMetaDescription(post.content);
  const ogImage =
    extractFirstImageFromContent(post.content) ?? FALLBACK_OG_IMAGE;
  const publishedTime = toIsoDate(post.created_at);
  const modifiedTime =
    toIsoDate((post as { updated_at?: string }).updated_at) ?? publishedTime;
  const title = post.title?.trim() || "Blog | Prestige Home";

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonicalUrl,
      siteName: "Prestige Home",
      locale: toOgLocale(locale),
      images: [
        {
          url: ogImage,
          alt: title,
        },
      ],
      publishedTime,
      modifiedTime,
      authors: ["Prestige Home Redaktion"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/* --------------------------------------------------------
 * 3) PAGE
 * ------------------------------------------------------*/
export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string[]; locale?: string }>;
}) {
  const { slug, locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const blogSlug = getFirstSlug(slug);
  if (!blogSlug) return notFound();

  let [post, sidebarData] = await Promise.all([
    getBlogDetailCached(blogSlug),
    getSidebarBlogsCached(),
  ]);

  if (!post) {
    post = await getBlogDetailsBySlug(blogSlug);
  }
  if (!post) return notFound();

  if (!sidebarData || (sidebarData.products?.length ?? 0) === 0) {
    sidebarData = await getBlogsByProduct({ is_econelo: undefined }).catch(
      () =>
        ({
          products: [],
          pagination_product: {
            page: 1,
            page_size: 5,
            total_items: 0,
            total_pages: 0,
          },
        }) as BlogByProductResponse,
    );
  }

  const schemas = buildBlogSchemas(
    post as {
      title?: string | null;
      slug?: string | null;
      content?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
    },
    locale,
  );

  return (
    <>
      {schemas && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
        />
      )}
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
    </>
  );
}
