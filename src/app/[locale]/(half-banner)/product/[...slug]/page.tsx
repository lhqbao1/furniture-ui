import { getProductBySlug, getProductsFeed } from "@/features/products/api";
import {
  getAllProductsSelect,
  getProductGroupDetail,
} from "@/features/product-group/api";
import type { Metadata } from "next";
import { ProductItem, StaticFile } from "@/types/products";
import { ReviewResponse } from "@/types/review";
import { ProductGroupDetailResponse } from "@/types/product-group";
import { BlogItem, BlogsResponse } from "@/types/blog";

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
import ProductReviewTab from "@/components/layout/single-product/tabs/review";
import { getInventoryPoByProductId } from "@/features/incoming-inventory/inventory/api";
import { calculateDeliveryEstimate } from "@/hooks/get-estimated-shipping";

/* --------------------------------------------------------
 * ENABLE PARTIAL PRERENDERING
 * ------------------------------------------------------*/
export const experimental_ppr = true;
export const revalidate = 3600;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string[]; locale: string }>;
}

function isPublishableProduct(product?: Partial<ProductItem> | null) {
  if (!product) return false;

  const hasSku =
    typeof product.sku === "string" && product.sku.trim().length > 0;
  const hasEan =
    typeof product.ean === "string" && product.ean.trim().length > 0;
  const hasCarrier =
    typeof product.carrier === "string" && product.carrier.trim().length > 0;
  const hasImages =
    Array.isArray(product.static_files) && product.static_files.length > 0;
  const hasDescription =
    typeof product.description === "string" &&
    product.description.trim().length > 0;
  const hasCategory =
    Array.isArray(product.categories) && product.categories.length > 0;
  const hasBrand =
    typeof product.brand?.name === "string" &&
    product.brand.name.trim().length > 0;
  const hasFinalPrice =
    product.final_price !== null &&
    product.final_price !== undefined &&
    Number.isFinite(Number(product.final_price));

  return (
    product.is_active === true &&
    hasSku &&
    hasEan &&
    hasImages &&
    hasCarrier &&
    hasDescription &&
    hasCategory &&
    hasBrand &&
    hasFinalPrice
  );
}

/* --------------------------------------------------------
 * 1) STATIC PARAMS
 * ------------------------------------------------------*/
export async function generateStaticParams() {
  let products: ProductItem[] = [];
  try {
    products = await getAllProductsSelect({
      is_econelo: undefined,
      all_products: true,
    });
  } catch (error) {
    console.error("❌ generateStaticParams /product/[...slug] failed:", error);
    return [];
  }
  const locales = ["de"];

  return products
    .filter(
      (p) =>
        p?.url_key &&
        typeof p.url_key === "string" &&
        p.url_key.length > 0 &&
        isPublishableProduct(p),
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
  // if (isPublishableProduct(product) === false) return notFound();

  const reviews = await getReviewByProduct(product.id);
  const hasReviews = reviews && reviews.length > 0;

  const baseTitle = product.meta_title || product.name;

  const title =
    product.categories?.[0]?.slug === "zaeune-sichtschutz"
      ? `${baseTitle} kaufen – WPC Sichtschutzzaun | Prestige Home`
      : baseTitle;

  const description =
    product.meta_description?.trim() ||
    product.description?.replace(/<[^>]*>/g, "").trim().slice(0, 160) ||
    `${product.name} online kaufen bei Prestige Home.`;

  return {
    title: title,
    description,
    openGraph: {
      title: title,
      description,
      url: `https://www.prestige-home.de/de/product/${product.url_key}`,
      images:
        product.static_files?.map((f: StaticFile) => ({ url: f.url })) ?? [],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description,
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

function isBlogsResponse(value: unknown): value is BlogsResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as BlogsResponse).items)
  );
}

function getGtinField(ean?: string | null): Record<string, string> | null {
  if (!ean) return null;
  const digits = ean.replace(/\D/g, "");

  if (digits.length === 8) return { gtin8: digits };
  if (digits.length === 12) return { gtin12: digits };
  if (digits.length === 13) return { gtin13: digits };
  if (digits.length === 14) return { gtin14: digits };

  return null;
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
  let product: ProductItem | null = null;

  try {
    product = await getProductBySlug(lastSlug);
  } catch (err) {
    console.error("❌ getProductBySlug failed:", err);
    return notFound();
  }

  if (!product) return notFound();

  // ⭐ Convert to JSON to avoid "function passed to client component"
  product = JSON.parse(JSON.stringify(product)) as ProductItem;
  // if (isPublishableProduct(product) === false) return notFound();

  /* ----------------------------------------------------
   * 2) PARALLEL REQUESTS (SAFE WRAPPED)
   * --------------------------------------------------*/
  let reviews: ReviewResponse[] = [];
  let parentProduct: ProductGroupDetailResponse | null = null;
  let relatedBlogs: unknown = null;
  let inventoryPo: unknown[] = [];

  try {
    const tasks: { key: string; promise: Promise<unknown> }[] = [
      { key: "reviews", promise: getReviewByProduct(product.id) },
      { key: "inventoryPo", promise: getInventoryPoByProductId(product.id) },
    ];

    if (product.parent_id) {
      tasks.push({
        key: "parentProduct",
        promise: getProductGroupDetail(product.parent_id),
      });
    }

    if (product.url_key) {
      tasks.push({
        key: "relatedBlogs",
        promise: getBlogsByProductSlug({
          product_slug: product.url_key ?? "",
          page: 1,
          page_size: 4,
        }),
      });
    }

    const results = await Promise.allSettled(tasks.map((task) => task.promise));

    results.forEach((result, index) => {
      if (result.status !== "fulfilled") return;

      const taskKey = tasks[index]?.key;
      if (taskKey === "reviews" && Array.isArray(result.value)) {
        reviews = result.value as ReviewResponse[];
        return;
      }

      if (taskKey === "inventoryPo" && Array.isArray(result.value)) {
        inventoryPo = result.value;
        return;
      }

      if (taskKey === "parentProduct") {
        parentProduct = result.value as ProductGroupDetailResponse;
        return;
      }

      if (taskKey === "relatedBlogs") {
        relatedBlogs = result.value;
      }
    });
  } catch (err) {
    console.error("❌ Error fetching child data:", err);
  }

  // Convert to plain JSON
  const plainProduct = toPlain(product);
  const plainReviews = toPlain(reviews);
  const plainParent = toPlain(parentProduct);
  const blogItems: BlogItem[] = isBlogsResponse(relatedBlogs)
    ? relatedBlogs.items
    : [];

  const availableStock = calculateAvailableStock(plainProduct);
  const serverDeliveryEstimate = calculateDeliveryEstimate({
    stock: availableStock,
    inventory: Array.isArray(inventoryPo) ? inventoryPo : [],
    deliveryTime: plainProduct.delivery_time,
  });

  const productSchema: Record<string, unknown> = {
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

  const gtinField = getGtinField(plainProduct.ean);
  if (gtinField) {
    Object.assign(productSchema, gtinField);
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
            serverDeliveryRange={
              serverDeliveryEstimate
                ? {
                    from: serverDeliveryEstimate.from.toISOString(),
                    to: serverDeliveryEstimate.to.toISOString(),
                  }
                : null
            }
          />

          <BoughtTogetherSection productDetails={plainProduct} />

          <div className="lg:mt-12 mt-0 shadow-[0_0_5px_rgba(0,0,0,0.1)] px-4 py-4 rounded-sm">
            <ProductDetailsTab reviews={plainReviews} product={plainProduct} />
          </div>

          <div className="lg:mt-6 mt-0 shadow-[0_0_5px_rgba(0,0,0,0.1)] px-4 py-4 rounded-sm">
            <ProductReviewTab productId={plainProduct.id} />
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

      {blogItems.length > 0 && (
        <div className="lg:mt-16 mt-10 pb-4 md:w-[95%] xl:w-3/4 w-[95%] mx-auto">
          <Suspense fallback={<ProductGridSkeleton length={4} />}>
            <RelatedBlogs blogs={blogItems} slug={product.url_key} />
          </Suspense>
        </div>
      )}
    </>
  );
}
