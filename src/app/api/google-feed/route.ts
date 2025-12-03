import { NextResponse } from "next/server";
import { getAllProducts, getProductsFeed } from "@/features/products/api";
import { cleanDescription, cleanImageLink } from "@/hooks/simplify-desciprtion";

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

    const formatName = (name: string) =>
      name.trim().toLowerCase().replace(/\s+/g, "-");
    const itemsXml = products
      .filter(
        (p) => p.final_price > 0 && p.is_active,
        // && allowedSkus.includes(p.sku) // lọc theo sku
      )
      .map((p) => {
        const categories = p.categories || [];

        const colors = p.options
          .filter((opt) => opt.variant_name?.toLowerCase() === "color")
          .map((opt) => opt.label)
          .join(", ");
        return `
<item>
  <g:id>${escapeXml(p.id_provider)}</g:id>
  <g:title><![CDATA[${escapeCDATA(p.name.trim())}]]></g:title>
  <g:description><![CDATA[${escapeCDATA(
    cleanDescription(p.description),
  )}]]></g:description>
<g:link>${escapeXml(
          encodeURI(
            `https://prestige-home.de/product${
              p.categories && p.categories.length > 0
                ? `/${p.categories[0].slug}`
                : ""
            }/${p.id}`,
          ),
        )}</g:link>
<g:image_link>${escapeXml(
          encodeURI(cleanImageLink(p.static_files[0]?.url)),
        )}</g:image_link>
  <g:availability>${p.stock > 0 ? "in_stock" : "out_of_stock"}</g:availability>
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
</item>`;
      })
      .join("\n");

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
