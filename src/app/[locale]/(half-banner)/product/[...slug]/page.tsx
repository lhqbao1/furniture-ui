import { getProductBySlug, getProductsFeed } from "@/features/products/api";
import {
  getAllProductsSelect,
  getProductGroupDetail,
} from "@/features/product-group/api";
import type { Metadata } from "next";
import { ProductItem, StaticFile } from "@/types/products";

import ProductDetails from "@/components/layout/single-product/product-details";
import { ProductDetailsTab } from "@/components/layout/single-product/product-tab";
import RelatedCategoryProducts from "@/components/layout/single-product/related-category";

import { getReviewByProduct } from "@/features/review/api";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import { getBlogsByProductSlug } from "@/features/blog/api";
import RelatedBlogs from "@/components/layout/single-product/related-blogs";
import BoughtTogetherSection from "@/components/layout/single-product/bought-together";
import Script from "next/script";
import { calculateAvailableStock } from "@/hooks/calculate_available_stock";

/* --------------------------------------------------------
 * ENABLE PARTIAL PRERENDERING
 * ------------------------------------------------------*/
export const experimental_ppr = true;
export const revalidate = 3600;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string[]; locale: string }>;
}

/* --------------------------------------------------------
 * 1) STATIC PARAMS
 * ------------------------------------------------------*/
export async function generateStaticParams() {
  const products = await getAllProductsSelect({
    is_econelo: false,
    all_products: true,
  });
  const locales = ["de"];

  return products
    .filter(
      (p) =>
        p?.url_key && typeof p.url_key === "string" && p.url_key.length > 0,
    )
    .flatMap((p) =>
      locales.map((locale) => ({
        locale,
        slug: [p.url_key],
      })),
    );
}

/* --------------------------------------------------------
 * 2) METADATA (can still run in PPR)
 * ------------------------------------------------------*/
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const lastSlug = Array.isArray(slug) ? slug.at(-1) : slug;

  if (!lastSlug) return {};

  let product = null;

  try {
    product = await getProductBySlug(lastSlug);
  } catch (err) {
    console.error("❌ getProductBySlug failed in metadata:", err);
    return {};
  }

  if (!product) return notFound();

  // SAFE JSON
  product = JSON.parse(JSON.stringify(product));

  const reviews = await getReviewByProduct(product.id);
  const hasReviews = reviews && reviews.length > 0;

  const baseTitle = product.meta_title || product.name;

  const title =
    product.categories?.[0]?.slug === "zaeune-sichtschutz"
      ? `${baseTitle} kaufen – WPC Sichtschutzzaun | Prestige Home`
      : baseTitle;

  return {
    title: title,
    description: product.meta_description || product.description?.slice(0, 150),
    openGraph: {
      title: title,
      description:
        product.meta_description || product.description?.slice(0, 150),
      url: `https://www.prestige-home.de/de/product/${product.url_key}`,
      images:
        product.static_files?.map((f: StaticFile) => ({ url: f.url })) ?? [],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description:
        product.meta_description || product.description?.slice(0, 150),
      images: product.static_files?.map((f: StaticFile) => f.url) ?? [],
    },
    alternates: {
      canonical: `/de/product/${product.url_key}`,
    },
  };
}

/* --------------------------------------------------------
 * 3) PAGE (PPR FRIENDLY IMPLEMENTATION)
 * ------------------------------------------------------*/

function toPlain<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const lastSlug = Array.isArray(slug) ? slug.at(-1) : slug;

  if (!lastSlug) return notFound();

  /* ----------------------------------------------------
   * 1) GET PRODUCT (wrapped in try/catch to prevent 502 crash)
   * --------------------------------------------------*/
  let product: any = null;

  try {
    product = await getProductBySlug(lastSlug);
  } catch (err) {
    console.error("❌ getProductBySlug failed:", err);
    return notFound(); // ✔ SAFE FALLBACK
  }

  if (!product) return notFound();

  // ⭐ Convert to JSON to avoid "function passed to client component"
  product = JSON.parse(JSON.stringify(product));

  /* ----------------------------------------------------
   * 2) PARALLEL REQUESTS (SAFE WRAPPED)
   * --------------------------------------------------*/
  let reviews = [];
  let parentProduct = null;
  let relatedBlogs = null;

  try {
    const promises: Promise<any>[] = [getReviewByProduct(product.id)];

    if (product.parent_id) {
      promises.push(getProductGroupDetail(product.parent_id));
    }

    if (product.slug || product.url_key) {
      promises.push(
        getBlogsByProductSlug({
          product_slug: product.slug ?? product.url_key,
          page: 1,
          page_size: 4,
        }),
      );
    }

    const results = await Promise.allSettled(promises);

    reviews = results[0].status === "fulfilled" ? results[0].value : [];

    parentProduct =
      results[1]?.status === "fulfilled" ? results[1].value : null;

    relatedBlogs = results[2]?.status === "fulfilled" ? results[2].value : null;
  } catch (err) {
    console.error("❌ Error fetching child data:", err);
  }

  // Convert to plain JSON
  const plainProduct = toPlain(product);
  const plainReviews = toPlain(reviews);
  const plainParent = toPlain(parentProduct);
  const plainBlogs = toPlain(relatedBlogs);

  const availableStock = calculateAvailableStock(plainProduct);

  const productSchema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: plainProduct.name,
    image: plainProduct.static_files?.map((f: StaticFile) => f.url),
    description: plainProduct.description,
    sku: plainProduct.sku,
    brand: {
      "@type": "Brand",
      name: plainProduct.brand?.name ?? "Prestige Home",
    },
    offers: {
      "@type": "Offer",
      url: `https://www.prestige-home.de/de/product/${plainProduct.url_key}`,
      priceCurrency: "EUR",
      price: String(plainProduct.final_price),
      availability:
        availableStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      priceValidUntil: "2026-12-31",
    },
  };

  if (plainProduct.ean) {
    productSchema.gtin13 = plainProduct.ean;
  }

  if (plainReviews && plainReviews.length > 0) {
    const ratingValue =
      plainReviews.reduce((s: number, r: { rating?: number }) => {
        return s + (r.rating || 0);
      }, 0) / plainReviews.length;

    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: ratingValue.toFixed(1),
      reviewCount: plainReviews.length,
    };
  }

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
      ...(plainProduct.categories?.[0]?.slug
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: plainProduct.categories?.[0]?.name ?? "Produkte",
              item: `https://www.prestige-home.de/de/category/${plainProduct.categories?.[0]?.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: plainProduct.categories?.[0]?.slug ? 3 : 2,
        name: plainProduct.name,
        item: `https://www.prestige-home.de/de/product/${plainProduct.url_key}`,
      },
    ],
  };

  return (
    <>
      <Script
        id="product-structured-data"
        type="application/ld+json"
        strategy="beforeInteractive"
      >
        {JSON.stringify([productSchema, breadcrumbSchema])}
      </Script>
      <div className="flex justify-center items-center">
        <div className="lg:w-10/12 w-full">
          {/* ️🔥 CRITICAL FIRST PAINT → PPR ưu tiên render */}
          <ProductDetails
            productDetails={plainProduct}
            reviews={plainReviews}
            parentProduct={plainParent}
          />

          <BoughtTogetherSection productDetails={plainProduct} />

          <div className="lg:mt-12 mt-0">
            <ProductDetailsTab reviews={plainReviews} product={plainProduct} />
          </div>
        </div>
      </div>

      {product.categories?.length > 0 && (
        <div className="md:w-[95%] xl:w-3/4 w-[95%] mx-auto">
          <Suspense fallback={<ProductGridSkeleton length={4} />}>
            <RelatedCategoryProducts
              categorySlug={product.categories[0].slug}
            />
          </Suspense>
        </div>
      )}

      {plainBlogs?.items?.length > 0 && (
        <div className="lg:mt-16 mt-10 pb-4 md:w-[95%] xl:w-3/4 w-[95%] mx-auto">
          <Suspense fallback={<ProductGridSkeleton length={4} />}>
            <RelatedBlogs blogs={plainBlogs.items} slug={product.url_key} />
          </Suspense>
        </div>
      )}
    </>
  );
}
