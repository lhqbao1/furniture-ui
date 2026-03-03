import { NextResponse } from "next/server";
import { getProductsFeed } from "@/features/products/api";
import { cleanDescription, cleanImageLink } from "@/hooks/simplify-desciprtion";
import { calculateAvailableStock } from "@/hooks/calculate_available_stock";

// Escape ký tự XML cho các field không dùng CDATA
const escapeXml = (str?: string) =>
  str
    ? str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;")
    : "";

// Escape CDATA nội dung, tránh lỗi "]]>"
const escapeCDATA = (str?: string) =>
  str ? str.replace(/]]>/g, "]]]]><![CDATA[>") : "";

export async function GET() {
  try {
    const products = await getProductsFeed();

    const hasRequiredFields = (p: unknown) => {
      if (!p || typeof p !== "object") return false;
      const product = p as {
        id_provider?: string;
        name?: string;
        url_key?: string;
        ean?: string;
      };
      return (
        typeof product.id_provider === "string" &&
        product.id_provider.trim().length > 0 &&
        typeof product.name === "string" &&
        product.name.trim().length > 0 &&
        typeof product.url_key === "string" &&
        product.url_key.trim().length > 0 &&
        typeof product.ean === "string" &&
        product.ean.trim().length > 0
      );
    };

    let skippedProducts = 0;

    const itemsXml = products
      .flatMap((p) => {
        if (!hasRequiredFields(p) || p.final_price <= 0 || !p.is_active) {
          skippedProducts += 1;
          return [];
        }

        try {
          const stock = calculateAvailableStock(p);
          const imageUrl = Array.isArray(p.static_files)
            ? cleanImageLink(p.static_files[0]?.url)
            : "";
          const brandName = p.brand?.name?.toLowerCase();
          const productUrl =
            brandName === "econelo"
              ? `https://econelo.de/produkt/${p.url_key}`
              : `https://prestige-home.de/de/product/${p.url_key}`;

          return [`
<item>
  <g:id>${escapeXml(p.id_provider)}</g:id>
  <g:title><![CDATA[${escapeCDATA(p.name.trim())}]]></g:title>
  <g:description><![CDATA[${escapeCDATA(
    cleanDescription(p.description ?? ""),
  )}]]></g:description>
<g:link>${escapeXml(
          encodeURI(productUrl),
        )}</g:link>
<g:image_link>${escapeXml(encodeURI(imageUrl))}</g:image_link>
  <g:availability>${stock > 0 ? "in_stock" : "out_of_stock"}</g:availability>
  <g:price>${p.final_price.toFixed(2)} EUR</g:price>
  <g:gtin>${escapeXml(p.ean)}</g:gtin>
  <g:condition>new</g:condition>
  <g:adult>no</g:adult>
  <g:age_group>adult</g:age_group>
  <g:is_bundle>no</g:is_bundle>
  <g:shipping>
    <g:country>DE</g:country>
    <g:service>Standard</g:service>
    <g:price>${p.carrier === "dpd" ? "5.95 EUR" : "35.95 EUR"}</g:price>
  </g:shipping>
  <g:shipping_label>${p.carrier === "dpd" ? "DPD" : "AMM"}</g:shipping_label>
</item>`];
        } catch (error) {
          skippedProducts += 1;
          console.warn("Skip invalid Google feed product row:", {
            id_provider: p?.id_provider,
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
    <link>https://prestige-home.de</link>
    <description>Product feed</description>
    ${itemsXml}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
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
