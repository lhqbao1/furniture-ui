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

        const categoryPath = p.categories
          ?.map((c) => {
            const child = c.children?.[0];
            return child ? `${c.name} > ${child.name}` : c.name;
          })
          .join(", ");

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
    <Artikelnummer>${escapeXml(p.id_provider)}</Artikelnummer>
    
    <Produktbezeichnung><![CDATA[${escapeCDATA(
      p.name.trim(),
    )}]]></Produktbezeichnung>

    <Herstellername>${escapeXml(
      p.brand ? p.brand.name : "Prestige Home",
    )}</Herstellername>

    <Preis>
      ${p.final_price.toFixed(2)}
    </Preis>

    <Deeplink>https://prestige-home.de/product/${escapeXml(
      p.url_key,
    )}</Deeplink>

    <MPN>${escapeXml(p.ean)}</MPN>

    <Verfügbarkeit>${categoryPath}</Verfügbarkeit>

    <Versand AT Vorkasse>${
      p.carrier === "dpd" ? 5.95 : 35.95
    }</Versand AT Vorkasse>
    <Versand DE Vorkasse>${
      p.carrier === "dpd" ? 5.95 : 35.95
    }</Versand DE Vorkasse>

    <EAN>${escapeXml(p.ean)}</EAN>

    <Kategorie>${escapeXml(categories)}</Kategorie>

    <Bild>${escapeXml(encodeURI(largeImage))}</Bild>

    <Beschreibung><![CDATA[${escapeCDATA(
      cleanDescription(p.description),
    )}]]></Beschreibung>
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
