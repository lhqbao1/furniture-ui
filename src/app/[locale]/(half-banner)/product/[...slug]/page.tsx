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

    // const reviews = await getReviewByProduct(product.id);
    if (!product) throw new Error("Not found");
    // if (!reviews) throw new Error("Not found");

    // --------------------------
    // ⚠ ONLY ADD RATING IF REAL
    // --------------------------
    // const hasRating = reviews;

    const schema: any = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: product.name,
      description: product.description,
      sku: product.sku || "",
      mpn: product.id_provider || "",
      gtin13: product.ean,
      brand: {
        "@type": "Brand",
        name: product.brand?.name || "Prestige Home",
      },
      image: product.static_files?.map((f: StaticFile) => f.url) ?? [
        "/placeholder-product.webp",
      ],
      offers: {
        "@type": "Offer",
        url: `https://www.prestige-home.de/${locale}/product/${product.url_key}`,
        priceCurrency: "EUR",
        price: product.final_price ?? product.price,
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

    // const reviewCount = reviews?.length || 0;
    // const ratingValue =
    //   reviewCount > 0
    //     ? (
    //         reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount
    //       ).toFixed(1)
    //     : "0";

    // // Add rating ONLY if real data exists
    // if (hasRating) {
    //   schema.aggregateRating = {
    //     "@type": "AggregateRating",
    //     ratingValue: ratingValue,
    //     reviewCount: reviewCount,
    //   };
    // }

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
  if (!product) return <div>Not Found</div>;

  // const reviews = await getReviewByProduct(
  //   "d1c6e2c8-6ca2-4671-ba05-83913a04b200",
  // );
  // console.log(product.id);

  const parentProduct = product.parent_id
    ? await getProductGroupDetail(product.parent_id)
    : null;

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["product", product.id],
    queryFn: () => getProductById(product.id),
    staleTime: 30000,
  });

  await queryClient.prefetchQuery({
    queryKey: ["reviews", "product", product.id],
    queryFn: () => getReviewByProduct(product.id),
    staleTime: 30000,
  });

  await queryClient.prefetchQuery({
    queryKey: ["product", product.id],
    queryFn: () => getProductById(product.id),
    staleTime: 30000,
  });

  if (product.parent_id) {
    await queryClient.prefetchQuery({
      queryKey: ["product-group", product.parent_id],
      queryFn: () => getProductGroupDetail(product.parent_id ?? ""),
      staleTime: 30000,
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetails
        parentProductData={parentProduct}
        productDetailsData={product}
        productId={product.id}
        reviews={[]}
      />
    </HydrationBoundary>
  );
}
