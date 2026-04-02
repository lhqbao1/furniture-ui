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

const hasCsvFieldValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "number") return Number.isFinite(value);
  return String(value).trim().length > 0;
};

export async function GET() {
  try {
    const products = await getAllProductsSelect({
      is_econelo: false,
      all_products: true,
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
      typeof p.color === "string" &&
      p.color.trim().length > 0 &&
      typeof p.materials === "string" &&
      p.materials.trim().length > 0 &&
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
        p.final_price <= 0 ||
        p.brand.name.toLowerCase() === "prestige works"
      ) {
        skippedProducts += 1;
        return [];
      }

      try {
        const availableStock = Number(calculateAvailableStock(p));
        const stockAmount =
          Number.isFinite(availableStock) && availableStock > 0
            ? Math.floor(availableStock)
            : 0;

        // Keep old behavior, but enforce explicit stock > 0 gate.
        if (stockAmount <= 0) {
          skippedProducts += 1;
          return [];
        }

        const size = `${p.height} x ${p.width} x ${p.length} cm`;
        const lyingSurface = `${p.width} x ${p.length} cm`;
        const color = p.color.replace(/\s+(and|und)\s+/gi, "/");

        const rowValues: Array<string | number> = [
          p.ean ?? "",
          p.id_provider ?? "",
          p.name ?? "",
          html(
            `<div>${cleanDescription(p.description || "")}<div>Artikel-ID: ${
              p.id_provider
            }</div></div>`,
          ),
          p.brand.name.toLowerCase() === "econelo"
            ? `https://econelo.de/produkt/${p.url_key}`
            : `https://prestige-home.de/de/product/${p.url_key}`,
          p.brand.name ?? "",
          p.color ? color.toUpperCase() : "",
          size,
          p.height ?? "",
          p.width ?? "",
          p.length ?? "",
          lyingSurface,
          p.materials ?? "",
          p.static_files?.[0]?.url ?? "",
          p.static_files?.[1]?.url ?? "",
          p.static_files?.[2]?.url ?? "",
          p.static_files?.[3]?.url ?? "",
          p.static_files?.[4]?.url ?? "",
          p.static_files?.[5]?.url ?? "",
          p.static_files?.[6]?.url ?? "",
          p.static_files?.[7]?.url ?? "",
          p.static_files?.[8]?.url ?? "",
          p.static_files?.[9]?.url ?? "",
          p.component ?? "",
          stockAmount,
          `${formatEuro(p.final_price)} €`,
          `${p.delivery_time} Werktage`,
          p.carrier === "amm" || p.carrier === "spedition"
            ? "Spedition"
            : "Paket",
          p.carrier === "amm" || p.carrier === "spedition"
            ? `${formatEuro(35.95)} €`
            : `${formatEuro(5.95)} €`,
          p.brand.name ?? "",
          p.brand.company_address ?? "",
          p.brand.company_postal_code ?? "",
          p.brand.company_city ?? "",
          p.brand.company_country ?? "",
          p.brand.company_email ?? "",
          p.brand.company_phone ?? "",
        ];

        const hasAllCsvFields =
          rowValues.length === headers.length &&
          rowValues.every((value) => hasCsvFieldValue(value));

        if (!hasAllCsvFields) {
          skippedProducts += 1;
          return [];
        }

        return [rowValues.map((value) => escapeCsv(value)).join(",")];
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
