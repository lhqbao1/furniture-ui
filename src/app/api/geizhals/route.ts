import { NextResponse } from "next/server";
import { cleanDescription } from "@/hooks/simplify-desciprtion";
import { getAllProductsSelect } from "@/features/product-group/api";
import { calculateAvailableStock } from "@/hooks/calculate_available_stock";

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
    const products = await getAllProductsSelect({
      is_econelo: false,
      all_products: true,
    });

    const hasRequiredFields = (p: unknown) => {
      if (!p || typeof p !== "object") return false;
      const product = p as {
        id_provider?: string;
        name?: string;
        url_key?: string;
        ean?: string;
        brand?: { name?: string };
      };
      return (
        typeof product.id_provider === "string" &&
        product.id_provider.trim().length > 0 &&
        typeof product.name === "string" &&
        product.name.trim().length > 0 &&
        typeof product.url_key === "string" &&
        product.url_key.trim().length > 0 &&
        typeof product.ean === "string" &&
        product.ean.trim().length > 0 &&
        typeof product.brand?.name === "string" &&
        product.brand.name.trim().length > 0
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
          const availableStock = calculateAvailableStock(p);
          if (availableStock <= 0) {
            skippedProducts += 1;
            return [];
          }

          const categories =
            p.categories?.map((c) => c.name).join(" > ") || "General";
          const largeImage =
            Array.isArray(p.static_files) && p.static_files.length > 0
              ? p.static_files[0]?.url ?? ""
              : "";
          const url =
            p.brand.name.toLowerCase() === "econelo"
              ? `https://econelo.de/produkt/${p.url_key}`
              : `https://prestige-home.de/de/product/${p.url_key}`;

          return [`
 <product>
  <Artikelnummer>${escapeXml(p.id_provider)}</Artikelnummer>

  <Produktbezeichnung><![CDATA[${escapeCDATA(
    p.name.trim(),
  )}]]></Produktbezeichnung>

  <Herstellername><![CDATA[${
    p.brand?.name || "Prestige Home"
  }]]></Herstellername>

  <Preis>${p.final_price.toFixed(2)}</Preis>

  <Deeplink><![CDATA[${url}]]></Deeplink>

  <MPN>${escapeXml(p.sku)}</MPN>

  <Verfügbarkeit>${p.delivery_time} Werktage</Verfügbarkeit>

<Versand_AT_Vorkasse>${p.carrier === "dpd" ? 5.95 : 35.95}</Versand_AT_Vorkasse>

<Versand_DE_Vorkasse>${p.carrier === "dpd" ? 5.95 : 35.95}</Versand_DE_Vorkasse>

  <EAN>${escapeXml(p.ean)}</EAN>

  <Kategorie><![CDATA[${categories}]]></Kategorie>

  <Bild><![CDATA[${escapeCDATA(largeImage)}]]></Bild>

  <Beschreibung><![CDATA[${escapeCDATA(
    cleanDescription(p.description),
  )}]]></Beschreibung>
</product>
`];
        } catch (error) {
          skippedProducts += 1;
          console.warn("Skip invalid Geizhals product row:", {
            id_provider: p?.id_provider,
            error,
          });
          return [];
        }
      })
      .join("\n");

    if (skippedProducts > 0) {
      console.warn(`Geizhals feed skipped ${skippedProducts} invalid products.`);
    }

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
