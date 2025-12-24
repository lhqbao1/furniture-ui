import { getProductBySlug, getProductsFeed } from "@/features/products/api";
import { getProductGroupDetail } from "@/features/product-group/api";
import type { Metadata } from "next";
import { StaticFile } from "@/types/products";

import ProductDetails from "@/components/layout/single-product/product-details";
import { ProductDetailsTab } from "@/components/layout/single-product/product-tab";
import RelatedCategoryProducts from "@/components/layout/single-product/related-category";

import { getReviewByProduct } from "@/features/review/api";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ComparePriceSection from "@/components/layout/single-product/compare-price/compare-price-section";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";

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
  const products = await getProductsFeed();
  const locales = ["de"];

  return products.flatMap((p) =>
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

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.static_files?.map((f: StaticFile) => f.url),
    description: product.description,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand?.name ?? "Prestige Home",
    },
    offers: {
      "@type": "Offer",
      url: `https://www.prestige-home.de/de/product/${product.url_key}`,
      priceCurrency: "EUR",
      price: String(product.final_price),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
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
        name: product.categories?.[0]?.name ?? "Produkte",
        item: `https://www.prestige-home.de/de/category/${product.categories?.[0]?.slug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `https://www.prestige-home.de/de/product/${product.url_key}`,
      },
    ],
  };

  if (hasReviews) {
    const ratingValue =
      reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length;

    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: ratingValue.toFixed(1),
      reviewCount: reviews.length,
    };
  }

  return {
    title: product.meta_title || product.name,
    description: product.meta_description || product.description?.slice(0, 150),
    openGraph: {
      title: product.meta_title || product.name,
      description:
        product.meta_description || product.description?.slice(0, 150),
      url: `https://www.prestige-home.de/de/product/${product.url_key}`,
      images:
        product.static_files?.map((f: StaticFile) => ({ url: f.url })) ?? [],
    },
    other: {
      "application/ld+json": JSON.stringify([schema, breadcrumbSchema]),
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

  try {
    reviews = await getReviewByProduct(product.id);
    if (product.parent_id) {
      parentProduct = await getProductGroupDetail(product.parent_id);
    }
  } catch (err) {
    console.error("❌ Error fetching child data:", err);
  }

  // Convert to plain JSON
  const plainProduct = toPlain(product);
  const plainReviews = toPlain(reviews);
  const plainParent = toPlain(parentProduct);

  return (
    <>
      <div className="flex justify-center items-center">
        <div className="lg:w-10/12 w-full">
          {/* ️🔥 CRITICAL FIRST PAINT → PPR ưu tiên render */}
          <ProductDetails
            productDetails={plainProduct}
            reviews={plainReviews}
            parentProduct={plainParent}
          />

          {plainProduct && plainProduct.marketplace_products.length > 0 && (
            <ComparePriceSection product={plainProduct} />
          )}

          <div className="lg:mt-12 mt-8">
            <ProductDetailsTab
              reviews={plainReviews}
              product={plainProduct}
            />
          </div>
        </div>
      </div>

      {product.categories?.length > 0 && (
        <Suspense fallback={<ProductGridSkeleton length={4} />}>
          <RelatedCategoryProducts categorySlug={product.categories[0].slug} />
        </Suspense>
      )}
    </>
  );
}
