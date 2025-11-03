import { NextResponse } from "next/server";
import { getProductsFeed } from "@/features/products/api";
import { cleanDescription, cleanImageLink } from "@/hooks/simplify-desciprtion";

const escapeXml = (str?: string) =>
  str
    ? str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;")
    : "";

const escapeCDATA = (str?: string) =>
  str ? str.replace(/]]>/g, "]]]]><![CDATA[>") : "";

export async function GET() {
  try {
    const products = await getProductsFeed();

    const itemsXml = products
      .filter((p) => p.final_price > 0 && p.is_active)
      .map((p) => {
        const images = p.static_files || [];
        const largeImage = images[0]
          ? cleanImageLink(images[0].url)
          : "";
        const subImages = images.slice(1);

        // Tạo XML cho sub images
        const subImagesXml = subImages
          .map(
            (img, idx) =>
              `  <g:sub_image_${idx + 1}>${escapeXml(
                encodeURI(cleanImageLink(img.url))
              )}</g:sub_image_${idx + 1}>`
          )
          .join("\n");

        const categories = p.categories || [];
        const colors = p.options
          ?.filter((opt) => opt.variant_name?.toLowerCase() === "color")
          .map((opt) => opt.label)
          .join(", ") || "";

        return `
<item>
  <g:id>${escapeXml(p.id_provider)}</g:id>
  <g:title><![CDATA[${escapeCDATA(p.name.trim())}]]></g:title>
  <g:description><![CDATA[${escapeCDATA(cleanDescription(p.description))}]]></g:description>
  <g:large_image>${escapeXml(encodeURI(largeImage))}</g:large_image>
${subImagesXml}
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
      { status: 500 }
    );
  }
}
