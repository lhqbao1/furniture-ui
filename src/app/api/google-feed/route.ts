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
const escapeCDATA = (str?: string) => (str ? str.replace(/]]>/g, "]]]]><![CDATA[>") : "");

export async function GET() {
  try {
    const products = await getProductsFeed();

    const allowedSkus = [
      "1202182-198842",
      "1202181-198841",
      "1202251-198952",
      "1199282-195553",
      "1205737-202880",
      "1199308-195579",
      "1199177-195443",
      "1199855-196375",
      "1199860-196380",
      "1199154-195420",
      "1199784-196301",
      "1199731-196247",
      "1199732-196248",
      "1199730-196246",
      "1199315-195586",
      "1199843-196363",
      "1199562-196022",
      "1199283-195554",
      "1199321-195592",
      "1206514-204306",
      "1206518-204310",
      "1206520-204312",
      "1206517-204309",
      "1206521-204314",
      "1199154-195419",
      "1082858-72099",
      "1152638-142245",
      "1152700-142350",
      "1067359-54144",
      "1152640-142247",
      "1152641-142248",
      "1152639-142246"
    ];

    const formatName = (name: string) => name.trim().toLowerCase().replace(/\s+/g, '-')
    const itemsXml = products
    .filter(
      (p) =>
        p.final_price > 0 &&
        p.is_active &&
        allowedSkus.includes(p.sku) // lọc theo sku
    )
    .map((p) => {
        const categories = p.categories || [];
        const level1 = categories.find(c => c.level === 1)
                    const level2 = categories.filter(c => c.level === 2)[0] // level 2 đầu tiên

                    const categoryHref = level1 && level2
                        ? `/${formatName(level1.name)}/${formatName(level2.name)}/${p.id}`
                        : level1
                            ? `/${formatName(level1.name)}/${p.id}`
                            : level2
                                ? `/${formatName(level2.name)}/${p.id}`
                                : `/${p.id}`

        const colors = p.options
          .filter((opt) => opt.variant_name?.toLowerCase() === "color")
          .map((opt) => opt.label)
          .join(", ");

        return `
<item>
  <g:id>${escapeXml(p.id_provider)}</g:id>
  <g:title><![CDATA[${escapeCDATA(p.name.trim())}]]></g:title>
  <g:description><![CDATA[${escapeCDATA(cleanDescription(p.description))}]]></g:description>
<g:link>${escapeXml(encodeURI(`https://prestige-home.de/product${categoryHref}`))}</g:link>
<g:image_link>${escapeXml(encodeURI(cleanImageLink(p.static_files[0]?.url)))}</g:image_link>
  <g:availability>${p.stock > 0 ? "in stock" : "out of stock"}</g:availability>
  <g:price>${p.final_price.toFixed(2)} EUR</g:price>
  <g:gtin>${escapeXml(p.ean)}</g:gtin>
  <g:condition>new</g:condition>
  <g:adult>no</g:adult>
  <g:age_group>adult</g:age_group>
  <g:is_bundle>no</g:is_bundle>
  <g:shipping>
    <g:country>DE</g:country>
    <g:service>Standard</g:service>
    <g:price>5.95 EUR</g:price>
  </g:shipping>
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
