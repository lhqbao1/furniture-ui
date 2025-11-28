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
    const products = await getProductsFeed();

    // Header CSV
    const headers = [
      "eans",
      "sku",
      "brand",
      "title",
      "categoryPath",
      "url",
      "hans",
      // "description",
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
      .filter((p) => p.final_price > 0 && p.is_active && p.stock > 0 && p.brand)
      .map((p) => {
        const categories =
          p.categories
            ?.map((c) => {
              const parent = c.name;
              const child = c.children?.[0]?.name;

              return child ? `${parent} > ${child}` : parent;
            })
            .join(", ") || "";
        return [
          escapeCsv(p.ean),
          escapeCsv(p.id_provider),
          escapeCsv(p.brand.company_name ?? "Prestige Home"),
          escapeCsv(p.name),
          escapeCsv(categories),
          escapeCsv(`https://prestige-home.de/de/product/${p.url_key}`),
          escapeCsv(p.sku),
          // escapeCsv(cleanDescription(p.description)),
          escapeCsv(
            (p.static_files || [])
              .map((f) => cleanImageLink(f?.url || ""))
              .filter(Boolean)
              .join(", "),
          ),
          escapeCsv(p.final_price.toFixed(2)),
          escapeCsv(`Delivery in ${p.delivery_time} working days`),
          "NEW",
          escapeCsv(p.number_of_packages ?? 1),
          escapeCsv(p.carrier === "dpd" ? 5.95 : 35.95),
          escapeCsv(p.color ?? ""),
          escapeCsv(p.materials ?? ""),
        ].join(",");
      });

    const csv = [headers.join(","), ...rows].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=feed.csv",
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
