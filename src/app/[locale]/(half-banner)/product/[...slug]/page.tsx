import {
  getAllProducts,
  getProductById,
  getProductBySlug,
  getProductsFeed,
} from "@/features/products/api";
import type { Metadata } from "next";
import { StaticFile } from "@/types/products";
import { getProductGroupDetail } from "@/features/product-group/api";
import ProductDetails from "@/components/layout/single-product/product-details";

interface PageProps {
  params: Promise<{ slug: string[]; locale: string }>;
}

// 🕒 ISR: tái tạo lại mỗi 1 giờ (3600s)
export const revalidate = 3600;
export const dynamicParams = true;

// 🏗️ Pre-render sản phẩm (SSG + ISR)
export async function generateStaticParams() {
  const products = await getProductsFeed();
  const locales = ["de", "en"];

  // Tạo path cho mỗi locale
  return products.flatMap((p) =>
    locales.map((locale) => ({
      locale,
      slug: [p.url_key], // Nếu có slug riêng, đổi thành [p.slug]
    }))
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const slugArray = Array.isArray(slug) ? slug : [slug];
  const lastSlug = slugArray[slugArray.length - 1];

  try {
    const product = await getProductBySlug(lastSlug);
    if (!product) throw new Error("No product found");

    // ✅ Tạo dữ liệu schema JSON-LD
    const productSchema = {
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
      image:
        product.static_files?.length > 0
          ? product.static_files.map((f) => f.url)
          : ["/placeholder-product.webp"],

      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "23",
      },
      review: [
        {
          "@type": "Review",
          author: { "@type": "Person", name: "Verified Customer" },
          datePublished: "2024-12-15",
          reviewRating: {
            "@type": "Rating",
            ratingValue: "5",
            bestRating: "5",
          },
          reviewBody:
            "Sehr bequem und qualitativ hochwertig. Schnelle Lieferung!",
        },
      ],

      offers: {
        "@type": "Offer",
        url: `https://www.prestige-home.de/${locale}/product/${product.url_key}`,
        priceCurrency: "EUR",
        price: product.final_price ?? product.price,
        priceValidUntil: "2026-12-31",
        availability:
          product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: {
          "@type": "Organization",
          name: "Prestige Home",
        },
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value:
              product.carrier?.toLowerCase() === "spedition" ? "35.95" : "5.95",
            currency: "EUR",
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "DE",
          },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: {
              "@type": "QuantitativeValue",
              minValue: 1,
              maxValue: 2,
              unitCode: "d",
            },
            transitTime: {
              "@type": "QuantitativeValue",
              minValue: 0,
              maxValue: 0,
              unitCode: "d",
            },
          },
        },
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "DE",
          returnPolicyCategory:
            "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: 14,
          returnMethod: "https://schema.org/ReturnByMail",
          returnFees: "https://schema.org/FreeReturn",
        },
      },
    };

    return {
      title: product.meta_title || product.name,
      description:
        product.meta_description || product.description?.slice(0, 150),
      robots: { index: true, follow: true },
      openGraph: {
        title: product.meta_title || product.name,
        description:
          product.meta_description || product.description?.slice(0, 150),
        url: `https://www.prestige-home.de/${locale}/product/${product.url_key}`,
        images:
          product.static_files?.map((img: StaticFile) => ({ url: img.url })) ??
          [],
      },
      alternates: {
        canonical: `https://www.prestige-home.de/${locale}/product/${product.url_key}`,
        languages: {
          de: `https://www.prestige-home.de/de/product/${product.url_key}`,
          en: `https://www.prestige-home.de/en/product/${product.url_key}`,
          "x-default": `https://www.prestige-home.de/de/product/${product.url_key}`,
        },
      },
      other: {
        // ✅ Inject schema JSON-LD
        "application/ld+json": JSON.stringify(productSchema),
      },
    };
  } catch (err) {
    console.error("generateMetadata error:", err);
    return {
      title: "Not found",
      description: "This page is not available",
      robots: { index: false, follow: false },
    };
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const resolvedParams = await params;
  const slugArray = Array.isArray(resolvedParams.slug)
    ? resolvedParams.slug
    : [resolvedParams.slug];
  const lastSlug = slugArray[slugArray.length - 1];

  const product = await getProductBySlug(lastSlug);
  let parentProduct = null;
  if (product?.parent_id) {
    parentProduct = await getProductGroupDetail(product.parent_id);
  }
  return (
    <ProductDetails
      parentProductData={parentProduct}
      productDetailsData={product}
      productId={product.id}
    />
  );
}
