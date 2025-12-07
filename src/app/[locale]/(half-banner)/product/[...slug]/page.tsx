import {
  getProductBySlug,
  getProductsFeed,
  getProductById,
} from "@/features/products/api";
import { getProductGroupDetail } from "@/features/product-group/api";
import type { Metadata } from "next";
import { StaticFile } from "@/types/products";

import ProductDetails from "@/components/layout/single-product/product-details";
import { ProductDetailsTab } from "@/components/layout/single-product/product-tab";
import RelatedCategoryProducts from "@/components/layout/single-product/related-category";

import getQueryClient from "@/lib/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getReviewByProduct } from "@/features/review/api";
import { notFound } from "next/navigation";

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

  const product = await getProductBySlug(lastSlug);
  if (!product) return notFound();

  const reviews = await getReviewByProduct(product.id);
  const hasReviews = reviews && reviews.length > 0;

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.static_files?.map((f) => f.url),
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
      images: product.static_files?.map((f) => ({ url: f.url })) ?? [],
    },
    other: {
      "application/ld+json": JSON.stringify(schema),
    },
  };
}

/* --------------------------------------------------------
 * 3) PAGE (PPR FRIENDLY IMPLEMENTATION)
 * ------------------------------------------------------*/
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const lastSlug = Array.isArray(slug) ? slug.at(-1) : slug;

  if (!lastSlug) return notFound();

  // ⚡ Critical data (prerenderable)
  const product = await getProductBySlug(lastSlug);
  if (!product) return notFound();

  // Non-critical data (will stream after)
  const reviewsPromise = getReviewByProduct(product.id);
  const parentPromise = product.parent_id
    ? getProductGroupDetail(product.parent_id)
    : null;

  const [reviews, parentProduct] = await Promise.all([
    reviewsPromise,
    parentPromise,
  ]);

  // Hydrate React Query
  const qc = getQueryClient();
  qc.setQueryData(["product", product.id], product);
  qc.setQueryData(["reviews", product.id], reviews);
  if (product.parent_id) {
    qc.setQueryData(["product-group", product.parent_id], parentProduct);
  }

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <div className="flex justify-center items-center">
        <div className="lg:w-10/12 w-full">
          {/* ️🔥 CRITICAL FIRST PAINT → PPR ưu tiên render */}
          <ProductDetails
            parentProductData={parentProduct}
            productDetailsData={product}
            productId={product.id}
            reviews={reviews}
          />

          {/* ️🔥 Stream phần không quan trọng */}
          <div className="lg:mt-12 mt-8">
            <ProductDetailsTab
              reviews={reviews}
              product={product}
            />
          </div>
        </div>
      </div>

      <RelatedCategoryProducts categorySlug={product.categories[0].slug} />
    </HydrationBoundary>
  );
}
