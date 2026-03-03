import { NextResponse } from "next/server";
import { getProductsFeed } from "@/features/products/api";
import { cleanImageLink } from "@/hooks/simplify-desciprtion";
import { calculateAvailableStock } from "@/hooks/calculate_available_stock";
import { ProductItem, StaticFile } from "@/types/products";
import { CategoryResponse } from "@/types/categories";

// Escape CSV value
const escapeCsv = (value?: string | number) => {
  if (value === undefined || value === null) return "";
  const str = String(value).replace(/"/g, '""'); // escape dấu "
  return /,|"/.test(str) ? `"${str}"` : str;
};

export async function GET() {
  try {
    const products = (await getProductsFeed()) ?? [];

    if (!Array.isArray(products)) {
      throw new Error("Products is not array");
    }

    const headers = [
      "eans",
      "sku",
      "brand",
      "title",
      "categoryPath",
      "url",
      "hans",
      "imageUrls",
      "price",
      "delivery",
      "conditionType",
      "packagingUnit",
      "deliveryCosts",
      "colour",
      "material",
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
      !!p.brand &&
      typeof p.brand.name === "string" &&
      p.brand.name.trim().length > 0 &&
      Array.isArray(p.static_files);

    let skippedProducts = 0;

    const rows = products.flatMap((p) => {
      if (!hasRequiredFields(p) || !p.is_active || p.final_price <= 0) {
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
          p.categories
            ?.map((c: CategoryResponse) => {
              const parent = c?.name ?? "";
              const child = c?.children?.[0]?.name;
              return child ? `${parent} > ${child}` : parent;
            })
            .join(", ") ?? "";

        const url =
          p.brand?.name?.toLowerCase() === "econelo"
            ? `https://econelo.de/produkt/${p.url_key ?? ""}`
            : `https://prestige-home.de/de/product/${p.url_key ?? ""}`;

        const images =
          p.static_files
            ?.map((f: StaticFile) => cleanImageLink(f?.url ?? ""))
            .filter(Boolean)
            .join(", ") ?? "";

        return [
          [
            escapeCsv(p.ean),
            escapeCsv(p.id_provider),
            escapeCsv(p.brand?.company_name ?? "Prestige Home"),
            escapeCsv(p.name ?? ""),
            escapeCsv(categories),
            escapeCsv(url),
            escapeCsv(p.sku),
            escapeCsv(images),
            escapeCsv(Number(p.final_price ?? 0).toFixed(2)),
            escapeCsv(
              `Lieferung innerhalb von ${p.delivery_time ?? 0} Werktagen nach Zahlungseingang`,
            ),
            "NEW",
            escapeCsv(p.number_of_packages ?? 1),
            escapeCsv(p.carrier === "dpd" ? 5.95 : 35.95),
            escapeCsv(p.color ?? ""),
            escapeCsv(p.materials ?? ""),
          ].join(","),
        ];
      } catch (rowErr) {
        skippedProducts += 1;
        console.warn("Skip invalid Idealo product row:", {
          id_provider: p?.id_provider,
          error: rowErr,
        });
        return [];
      }
    });

    if (skippedProducts > 0) {
      console.warn(`Idealo feed skipped ${skippedProducts} invalid products.`);
    }

    const csv = [headers.join(","), ...rows].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=feed.csv",
      },
    });
  } catch (err) {
    console.error("Feed error:", err);

    return NextResponse.json(
      {
        success: false,
        error: "Feed generation failed",
      },
      { status: 200 }, // 👈 tránh 500 để bot không mark feed fail
    );
  }
}
