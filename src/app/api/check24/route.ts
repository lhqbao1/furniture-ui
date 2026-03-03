import { NextResponse } from "next/server";
import { cleanDescription } from "@/hooks/simplify-desciprtion";
import { getAllProductsSelect } from "@/features/product-group/api";
import { calculateAvailableStock } from "@/hooks/calculate_available_stock";
import { ProductItem } from "@/types/products";

// Escape CSV value
const escapeCsv = (value?: string | number) => {
  if (value === undefined || value === null) return "";
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`; // ALWAYS quote → safest
};

export async function GET() {
  try {
    const products = await getAllProductsSelect({
      is_econelo: false,
      all_products: true,
      supplier_id: "prestige_home",
    });

    const formatEuro = (value: number) => value.toFixed(2).replace(".", ",");

    const html = (value: string) => `<span>${value}</span>`;

    // Header CSV
    const headers = [
      "EAN (GTIN14)",
      "offer_id",
      "name",
      "description",
      "deeplink",
      "brand",
      "color",
      "size",
      "size_height",
      "size_width",
      "size_depth",
      "size_lying_surface",
      "material",
      "Bildlink_1",
      "Bildlink_2",
      "Bildlink_3",
      "Bildlink_4",
      "Bildlink_5",
      "Bildlink_6",
      "Bildlink_7",
      "Bildlink_8",
      "Bildlink_9",
      "Bildlink_10",
      "delivery_includes",
      "stock_amount",
      "price",
      "delivery_time",
      "shipping_mode",
      "shipping_cost",
      "manufacturer_name",
      "manufacturer_street",
      "manufacturer_postcode",
      "manufacturer_city",
      "manufacturer_country",
      "manufacturer_email",
      "manufacturer_phone_number",
    ];

    const hasRequiredFields = (p: ProductItem) =>
      p &&
      typeof p.ean === "string" &&
      p.ean.trim().length > 0 &&
      typeof p.id_provider === "string" &&
      p.id_provider.trim().length > 0 &&
      typeof p.name === "string" &&
      p.name.trim().length > 0 &&
      typeof p.url_key === "string" &&
      p.url_key.trim().length > 0 &&
      typeof p.color === "string" &&
      p.color.trim().length > 0 &&
      typeof p.materials === "string" &&
      p.materials.trim().length > 0 &&
      !!p.brand &&
      typeof p.brand.name === "string" &&
      p.brand.name.trim().length > 0 &&
      typeof p.component === "string" &&
      p.component.trim().length > 0 &&
      typeof p.carrier === "string" &&
      p.carrier.trim().length > 0 &&
      Array.isArray(p.static_files);

    let skippedProducts = 0;

    const rows = products.flatMap((p) => {
      if (
        !hasRequiredFields(p) ||
        !p.is_active ||
        p.final_price <= 0 ||
        p.brand.name.toLowerCase() === "prestige works"
      ) {
        skippedProducts += 1;
        return [];
      }

      try {
        const availableStock = calculateAvailableStock(p);
        if (availableStock <= 0) {
          skippedProducts += 1;
          return [];
        }

        const size = `${p.height} x ${p.width} x ${p.length} cm`;
        const lyingSurface = `${p.width} x ${p.length} cm`;
        const color = p.color.replace(/\s+(and|und)\s+/gi, "/");

        return [
          [
            escapeCsv(p.ean),
            escapeCsv(p.id_provider),
            escapeCsv(p.name),
            escapeCsv(
              html(
                `<div>${cleanDescription(p.description || "")}<div>Artikel-ID: ${
                  p.id_provider
                }</div></div>`,
              ),
            ),
            escapeCsv(
              p.brand.name.toLowerCase() === "econelo"
                ? `https://econelo.de/produkt/${p.url_key}`
                : `https://prestige-home.de/de/product/${p.url_key}`,
            ),
            escapeCsv(p.brand.name ?? ""),
            escapeCsv(p.color ? color.toUpperCase() : ""),
            escapeCsv(size),
            escapeCsv(p.height),
            escapeCsv(p.width),
            escapeCsv(p.length),
            escapeCsv(lyingSurface),
            escapeCsv(p.materials ?? ""),
            escapeCsv(p.static_files.length > 0 ? p.static_files[0].url : ""),
            escapeCsv(p.static_files.length > 1 ? p.static_files[1].url : ""),
            escapeCsv(p.static_files.length > 2 ? p.static_files[2].url : ""),
            escapeCsv(p.static_files.length > 3 ? p.static_files[3].url : ""),
            escapeCsv(p.static_files.length > 4 ? p.static_files[4].url : ""),
            escapeCsv(p.static_files.length > 5 ? p.static_files[5].url : ""),
            escapeCsv(p.static_files.length > 6 ? p.static_files[6].url : ""),
            escapeCsv(p.static_files.length > 7 ? p.static_files[7].url : ""),
            escapeCsv(p.static_files.length > 8 ? p.static_files[8].url : ""),
            escapeCsv(p.static_files.length > 9 ? p.static_files[9].url : ""),
            escapeCsv(p.component),
            escapeCsv(availableStock < 0 ? 0 : availableStock),
            escapeCsv(`${formatEuro(p.final_price)} €`),
            escapeCsv(`${p.delivery_time} Werktage`),
            escapeCsv(
              p.carrier === "amm" || p.carrier === "spedition"
                ? "Spedition"
                : "Paket",
            ),
            escapeCsv(
              p.carrier === "amm" || p.carrier === "spedition"
                ? `${formatEuro(35.95)} €`
                : `${formatEuro(5.95)} €`,
            ),
            escapeCsv(p.brand.name ?? ""),
            escapeCsv(p.brand.company_address ?? ""),
            escapeCsv(p.brand.company_postal_code ?? ""),
            escapeCsv(p.brand.company_city ?? ""),
            escapeCsv(p.brand.company_country ?? ""),
            escapeCsv(p.brand.company_email ?? ""),
            escapeCsv(p.brand.company_phone ?? ""),
          ].join(","),
        ];
      } catch (error) {
        skippedProducts += 1;
        console.warn("Skip invalid Check24 product row:", {
          id_provider: p?.id_provider,
          error,
        });
        return [];
      }
    });

    if (skippedProducts > 0) {
      console.warn(`Check24 feed skipped ${skippedProducts} invalid products.`);
    }

    const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=check24-feed.csv",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to generate CSV feed" },
      { status: 500 },
    );
  }
}
