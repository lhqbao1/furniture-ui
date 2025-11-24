import {
  getProductBySlug,
  getProductsFeed,
  getProductById,
} from "@/features/products/api";
import { getProductGroupDetail } from "@/features/product-group/api";
import type { Metadata } from "next";
import { StaticFile } from "@/types/products";
import ProductDetails from "@/components/layout/single-product/product-details";

import getQueryClient from "@/lib/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getReviewByProduct } from "@/features/review/api";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string[]; locale: string }>;
}

export const revalidate = 3600;
export const dynamicParams = true;

/* --------------------------------------------------------
 * 1) generateStaticParams (ISR + SSG)
 * ------------------------------------------------------*/
export async function generateStaticParams() {
  const products = await getProductsFeed();
  const locales = ["de", "en"];

  return products.flatMap((p) =>
    locales.map((locale) => ({
      locale,
      slug: [p.url_key],
    })),
  );
}

/* --------------------------------------------------------
 * 2) Metadata + JSON-LD (SAFE for Merchant Center)
 * ------------------------------------------------------*/
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const slugArr = Array.isArray(slug) ? slug : [slug];
  const lastSlug = slugArr[slugArr.length - 1];

  try {
    const product = await getProductBySlug(lastSlug);
    if (!product) return notFound();

    const reviews = await getReviewByProduct(product.id);
    // if (!reviews) throw new Error("Not found");

    // --------------------------
    // ⚠ ONLY ADD RATING IF REAL
    // --------------------------
    const hasRating = reviews && reviews.length > 0;

    const schema: any = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: product.name,
      description: product.description,
      sku: String(product.sku || ""),
      mpn: String(product.id_provider || ""),
      gtin13: String(product.ean || ""),
      brand: {
        "@type": "Brand",
        name: product.brand?.name || "Prestige Home",
      },
      image: (product.static_files || [])
        .map((f: StaticFile) => f.url)
        .filter(Boolean),

      offers: {
        "@type": "Offer",
        url: `https://www.prestige-home.de/${locale}/product/${product.url_key}`,
        priceCurrency: "EUR",
        price: String(product.final_price),
        availability:
          product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: {
          "@type": "Organization",
          name: "Prestige Home",
        },
      },
    };

    // ⭐⭐ ONLY add rating if real reviews exist
    const reviewCount = reviews?.length || 0;
    if (hasRating) {
      const ratingValue = (
        reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount
      ).toFixed(1);

      schema.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: ratingValue,
        reviewCount: reviewCount,
      };
    }

    return {
      title: product.meta_title || product.name,
      description:
        product.meta_description ||
        product.description?.slice(0, 150) ||
        product.name,
      openGraph: {
        title: product.meta_title || product.name,
        description:
          product.meta_description ||
          product.description?.slice(0, 150) ||
          product.name,
        url: `https://www.prestige-home.de/${locale}/product/${product.url_key}`,
        images:
          product.static_files?.map((img: StaticFile) => ({ url: img.url })) ??
          [],
      },

      alternates: {
        canonical: `https://www.prestige-home.de/${locale}/product/${product.url_key}`,
      },

      other: {
        "application/ld+json": JSON.stringify(schema),
      },
    };
  } catch (err) {
    return {
      title: "Not found",
      robots: { index: false, follow: false },
    };
  }
}

/* --------------------------------------------------------
 * 3) PAGE - SERVER COMPONENT
 * ------------------------------------------------------*/
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const resolved = await params;
  const slugArr = Array.isArray(resolved.slug)
    ? resolved.slug
    : [resolved.slug];
  const lastSlug = slugArr[slugArr.length - 1];

  const product = await getProductBySlug(lastSlug);
  if (!product) return notFound();

  const reviews = await getReviewByProduct(product.id);

  const parentProduct = product.parent_id
    ? await getProductGroupDetail(product.parent_id)
    : null;

  const queryClient = getQueryClient();

  queryClient.setQueryData(["product", product.id], product);
  queryClient.setQueryData(["reviews", "product", product.id], reviews);

  if (product.parent_id) {
    queryClient.setQueryData(
      ["product-group", product.parent_id],
      parentProduct,
    );
  }

  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductDetails
          parentProductData={parentProduct}
          productDetailsData={product}
          productId={product.id}
          reviews={reviews}
        />
      </HydrationBoundary>
    </>
  );
}
