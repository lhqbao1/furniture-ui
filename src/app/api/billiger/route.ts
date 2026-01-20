import { NextResponse } from "next/server";
import { getProductsFeed } from "@/features/products/api";
import { cleanDescription, cleanImageLink } from "@/hooks/simplify-desciprtion";

// Escape CSV value
const escapeCsv = (value?: string | number) => {
  if (value === undefined || value === null) return "";
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`; // ALWAYS quote → safest
};

export async function GET() {
  try {
    const products = await getProductsFeed();

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

    const rows = products
      .filter(
        (p) =>
          p.final_price > 0 &&
          p.is_active &&
          p.stock > 0 &&
          p.brand &&
          p.component &&
          p.carrier,
      )
      .map((p) => {
        const categories = p.categories?.map((c) => c.name).join(", ") || "";
        const size = `${p.height} x ${p.width} x ${p.length} cm`;
        const lyingSurface = `${p.width} x ${p.length} cm`;
        const color = p.color.replace(/\s+(and|und)\s+/gi, "/");

        return [
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
            p.brand
              ? p.brand.name.toLowerCase() === "econelo"
                ? `https://econelo.de/produkt/${p.url_key}`
                : `https://prestige-home.de/de/product/${p.url_key}`
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
          escapeCsv(p.stock ?? ""),
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
        ].join(",");
      });

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
