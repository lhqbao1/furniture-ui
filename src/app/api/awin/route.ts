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
        const largeImage = images[0] ? cleanImageLink(images[0].url) : "";
        const subImages = images.slice(1);

        // Nếu có nhiều ảnh thì lấy thêm 1 ảnh làm alternate/thumbnail
        const alternateImage = subImages[0]
          ? cleanImageLink(subImages[0].url)
          : largeImage;

        const categories =
          p.categories?.map((c) => c.name).join(" > ") || "General";
        const colors =
          p.options
            ?.filter((opt) => opt.variant_name?.toLowerCase() === "color")
            .map((opt) => opt.label)
            .join(", ") || "";

        return `
  <product weboffer="no" preorder="no" instock="${
    p.stock > 0 ? "yes" : "no"
  }" forsale="${p.is_active ? "yes" : "no"}">
    <name><![CDATA[${escapeCDATA(p.name.trim())}]]></name>
    <pid>${escapeXml(p.id_provider || p.id)}</pid>
    <desc><![CDATA[${escapeCDATA(cleanDescription(p.description))}]]></desc>
    <category>${escapeXml(categories)}</category>
    <purl>${
      p.brand
        ? p.brand.name.toLowerCase() === "econelo"
          ? `https://econelo.de/produkt/${p.url_key}`
          : `https://prestige-home.de/de/product/${p.url_key}`
        : `https://prestige-home.de/de/product/${p.url_key}`
    }</purl>
    <imgurl>${escapeXml(encodeURI(largeImage))}</imgurl>
    <price>
      ${p.final_price.toFixed(2)}
    </price>
    <ean>${escapeXml(p.ean)}</ean>
    <upc/>
    <isbn/>
    <mpn>${escapeXml(p.id_provider)}</mpn>
    <parentpid>${escapeXml(p.parent_id ?? "")}</parentpid>
    <brand>${escapeXml(p.brand ? p.brand.name : "Prestige Home")}</brand>
    <colour>${escapeXml(colors)}</colour>
    <condition>new</condition>
    <keywords>${escapeXml(
      [p.name, p.brand, colors].filter(Boolean).join(", "),
    )}</keywords>
    <lang>DE</lang>
    <ptype>${escapeXml(p.categories?.[0]?.name || "Product")}</ptype>
    <currency>EUR</currency>
    <delcost>${p.carrier === "dpd" ? "5.95" : "35.95"}</delcost>
    <deltime>${
      p.delivery_time
        ? `Standard delivery in ${p.delivery_time} working days`
        : `Standard delivery in 3-5 working days`
    }</deltime>
    <stockquant>${p.stock}</stockquant>
    <alternate_image>${escapeXml(encodeURI(alternateImage))}</alternate_image>
    <large_image>${escapeXml(encodeURI(largeImage))}</large_image>
    <thumburl>${escapeXml(encodeURI(largeImage))}</thumburl>
    <lastupdated>${new Date()
      .toISOString()
      .replace("T", " ")
      .slice(0, 19)}</lastupdated>
  </product>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<merchant>
${itemsXml}
</merchant>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to generate AWIN XML feed" },
      { status: 500 },
    );
  }
}
