import { NextResponse } from "next/server";
import { getProductsFeed } from "@/features/products/api";
import { cleanDescription, cleanImageLink } from "@/hooks/simplify-desciprtion";
import { calculateAvailableStock } from "@/hooks/calculate_available_stock";
import type { ProductItem } from "@/types/products";

export const dynamic = "force-dynamic";

const STORE_URL = "https://prestige-home.de";
const ECONOLO_URL = "https://econelo.de";
const FEED_FILENAME = "google-feed.xml";

const escapeXml = (value?: string | number | null) =>
  value !== undefined && value !== null
    ? String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;")
    : "";

const escapeCDATA = (str?: string) =>
  str ? str.replace(/]]>/g, "]]]]><![CDATA[>") : "";

const normalizeText = (value?: string | null) => value?.trim() ?? "";

const toPositivePrice = (value: unknown) => {
  const price = Number(value);
  return Number.isFinite(price) && price > 0 ? price : null;
};

const getBrandName = (product: ProductItem) =>
  normalizeText(product.brand?.company_name) ||
  normalizeText(product.brand?.name) ||
  "Prestige Home";

const getProductUrl = (product: ProductItem) => {
  const brandName = normalizeText(product.brand?.name).toLowerCase();
  const baseUrl = brandName === "econelo" ? ECONOLO_URL : STORE_URL;
  const path = brandName === "econelo" ? "produkt" : "de/product";

  return `${baseUrl}/${path}/${product.url_key}`;
};

const getImageUrl = (product: ProductItem) => {
  const imageUrl = Array.isArray(product.static_files)
    ? product.static_files.find((file) => file?.url)?.url
    : "";
  return imageUrl ? cleanImageLink(imageUrl) : "";
};

const getShippingPrice = (product: ProductItem) =>
  normalizeText(product.carrier).toLowerCase() === "dpd" ? "5.95" : "35.95";

const hasRequiredFields = (product: ProductItem) =>
  Boolean(
    normalizeText(product.id_provider) &&
      normalizeText(product.name) &&
      cleanDescription(product.description ?? "") &&
      normalizeText(product.url_key) &&
      normalizeText(product.ean) &&
      getImageUrl(product) &&
      toPositivePrice(product.final_price),
  );

const buildGoogleFeedItem = (product: ProductItem) => {
  const price = toPositivePrice(product.final_price);
  if (!price) return null;

  const title = normalizeText(product.name);
  const description = cleanDescription(product.description ?? "");
  const productUrl = getProductUrl(product);
  const imageUrl = getImageUrl(product);
  const carrier = normalizeText(product.carrier).toLowerCase();
  const stock = Math.max(calculateAvailableStock(product), 0);
  const availability = stock > 0 ? "in stock" : "out of stock";
  const brandName = getBrandName(product);
  const categories = product.categories
    ?.map((category) => normalizeText(category.name))
    .filter(Boolean)
    .join(" > ");

  return `
    <item>
      <title><![CDATA[${escapeCDATA(title)}]]></title>
      <link>${escapeXml(encodeURI(productUrl))}</link>
      <description><![CDATA[${escapeCDATA(description)}]]></description>
      <g:id>${escapeXml(product.id_provider)}</g:id>
      <g:image_link>${escapeXml(encodeURI(imageUrl))}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${price.toFixed(2)} EUR</g:price>
      <g:condition>new</g:condition>
      <g:brand>${escapeXml(brandName)}</g:brand>
      <g:gtin>${escapeXml(product.ean)}</g:gtin>
      <g:mpn>${escapeXml(product.sku || product.id_provider)}</g:mpn>
      <g:adult>no</g:adult>
      <g:age_group>adult</g:age_group>
      <g:is_bundle>${product.is_bundle ? "yes" : "no"}</g:is_bundle>${
        categories
          ? `
      <g:product_type>${escapeXml(categories)}</g:product_type>`
          : ""
      }
      <g:shipping>
        <g:country>DE</g:country>
        <g:service>${carrier === "dpd" ? "DPD" : "Spedition"}</g:service>
        <g:price>${getShippingPrice(product)} EUR</g:price>
      </g:shipping>
      <g:shipping_label>${carrier === "dpd" ? "DPD" : "AMM"}</g:shipping_label>
    </item>`;
};

export async function GET() {
  try {
    const products = await getProductsFeed();

    let skippedProducts = 0;

    const itemsXml = products
      .flatMap((product) => {
        if (!product.is_active || !hasRequiredFields(product)) {
          skippedProducts += 1;
          return [];
        }

        try {
          const item = buildGoogleFeedItem(product);
          if (!item) {
            skippedProducts += 1;
            return [];
          }

          return [item];
        } catch (error) {
          skippedProducts += 1;
          console.warn("Skip invalid Google feed product row:", {
            id_provider: product.id_provider,
            error,
          });
          return [];
        }
      })
      .join("\n");

    if (skippedProducts > 0) {
      console.warn(`Google feed skipped ${skippedProducts} invalid products.`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Prestige Home Feed</title>
    <link>${STORE_URL}</link>
    <description>Prestige Home product feed for Google Merchant Center</description>
${itemsXml}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Content-Disposition": `inline; filename="${FEED_FILENAME}"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to generate XML feed" },
      { status: 500 },
    );
  }
}
