import { NextResponse } from "next/server";
import { getProductsFeed } from "@/features/products/api";
import { cleanDescription, cleanImageLink } from "@/hooks/simplify-desciprtion";

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

    const rows = products
      .filter(
        (p) =>
          p &&
          Number(p.final_price) > 0 &&
          p.is_active === true &&
          Number(p.stock) > 0
      )
      .map((p) => {
        try {
          const categories =
            p.categories?.map((c: any) => {
              const parent = c?.name ?? "";
              const child = c?.children?.[0]?.name;
              return child ? `${parent} > ${child}` : parent;
            }).join(", ") ?? "";

          const url =
            p.brand?.name?.toLowerCase() === "econelo"
              ? `https://econelo.de/produkt/${p.url_key ?? ""}`
              : `https://prestige-home.de/de/product/${p.url_key ?? ""}`;

          const images =
            p.static_files
              ?.map((f: any) => cleanImageLink(f?.url ?? ""))
              .filter(Boolean)
              .join(", ") ?? "";

          return [
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
              `Lieferung innerhalb von ${p.delivery_time ?? 0} Werktagen nach Zahlungseingang`
            ),
            "NEW",
            escapeCsv(p.number_of_packages ?? 1),
            escapeCsv(p.carrier === "dpd" ? 5.95 : 35.95),
            escapeCsv(p.color ?? ""),
            escapeCsv(p.materials ?? ""),
          ].join(",");
        } catch (rowErr) {
          console.error("Row error:", rowErr, p?.id);
          return null;
        }
      })
      .filter(Boolean);

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
      { status: 200 } // 👈 tránh 500 để bot không mark feed fail
    );
  }
}
