import { NextResponse } from "next/server";
import { getProductsFeed } from "@/features/products/api";
import { cleanDescription } from "@/hooks/simplify-desciprtion";
import { calculateAvailableStock } from "@/hooks/calculate_available_stock";

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
      "sku",
      "ean",
      "sku_manufacturer",
      "brand",
      "manufacturer",
      "title",
      "description",
      "product_url",
      "image_1",
      "image_2",
      "image_3",
      "product_price_vat_inc",
      "retail_price_vat_inc",
      "min_quantity",
      "increment",
      "quantity",
      "carrier_grid_1",
      "shipping_time_carrier_grid_1",
      "DisplayWeight",
    ];

    const hasRequiredFields = (p: unknown) => {
      if (!p || typeof p !== "object") return false;
      const product = p as {
        id_provider?: string;
        ean?: string;
        sku?: string;
        name?: string;
        url_key?: string;
        brand?: { name?: string };
        carrier?: string;
        delivery_time?: string;
        static_files?: unknown[];
      };
      return (
        typeof product.id_provider === "string" &&
        product.id_provider.trim().length > 0 &&
        typeof product.ean === "string" &&
        product.ean.trim().length > 0 &&
        typeof product.sku === "string" &&
        product.sku.trim().length > 0 &&
        typeof product.name === "string" &&
        product.name.trim().length > 0 &&
        typeof product.url_key === "string" &&
        product.url_key.trim().length > 0 &&
        typeof product.brand?.name === "string" &&
        product.brand.name.trim().length > 0 &&
        typeof product.carrier === "string" &&
        product.carrier.trim().length > 0 &&
        typeof product.delivery_time === "string" &&
        product.delivery_time.trim().length > 0 &&
        Array.isArray(product.static_files)
      );
    };

    let skippedProducts = 0;

    const rows = products.flatMap((p) => {
      if (
        !hasRequiredFields(p) ||
        p.final_price <= 0 ||
        !p.is_active ||
        !p.price ||
        p.price <= 0
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

        return [[
          escapeCsv(p.id_provider),
          escapeCsv(p.ean),
          escapeCsv(p.sku),
          escapeCsv(p.brand.name ?? ""),
          escapeCsv(p.manufacture_country ?? ""),
          escapeCsv(p.name ?? ""),
          escapeCsv(html(cleanDescription(p.description))),
          escapeCsv(
            p.brand
              ? p.brand.name.toLowerCase() === "econelo"
                ? `https://econelo.de/produkt/${p.url_key}`
                : `https://prestige-home.de/de/product/${p.url_key}`
              : `https://prestige-home.de/de/product/${p.url_key}`,
          ),
          escapeCsv(p.static_files.length > 0 ? p.static_files[0].url : ""),
          escapeCsv(p.static_files.length > 1 ? p.static_files[1].url : ""),
          escapeCsv(p.static_files.length > 2 ? p.static_files[2].url : ""),
          escapeCsv(formatEuro(p.final_price)),
          escapeCsv(formatEuro(p.price || 0)),
          escapeCsv(1),
          escapeCsv(1),
          escapeCsv(availableStock < 0 ? 0 : availableStock),

          escapeCsv(p.carrier.toUpperCase()),
          escapeCsv(p.delivery_time.replace(/(\d+)-(\d+)/, "$1#$2")),
          escapeCsv(p.weight ?? 0),
        ].join(",")];
      } catch (error) {
        skippedProducts += 1;
        console.warn("Skip invalid ManoMano product row:", {
          id_provider: p?.id_provider,
          error,
        });
        return [];
      }
    });

    if (skippedProducts > 0) {
      console.warn(`ManoMano feed skipped ${skippedProducts} invalid products.`);
    }

    const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=manomano-feed.csv",
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
