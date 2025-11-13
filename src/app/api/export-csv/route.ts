import { NextResponse } from "next/server";
import { getProductsFeed } from "@/features/products/api";
import { cleanDescription, cleanImageLink } from "@/hooks/simplify-desciprtion";

// Escape CSV value
const escapeCsv = (value?: string | number) => {
  if (value === undefined || value === null) return '';
  const str = String(value).replace(/"/g, '""'); // escape dấu "
  return /,|"/.test(str) ? `"${str}"` : str;
};

export async function GET() {
  try {
    const products = await getProductsFeed();

    // Header CSV
    const headers = [
      "id",
      "name",
      "description",
      "link",
      "image_link",
      "availability",
      "stock",
      "price",
      "gtin",
      "condition",
      "adult",
      "age_group",
      "is_bundle",
      "shipping_country",
      "shipping_service",
      "shipping_price",
      "shipping_label",
      "colors",
      "categories",
      "length",
      "width",
      "height",
      "weight",
      "materials",
      "manufacturer_name",
      "manufacturer_address",
      "manufacturer_phone",
      "manufacturer_email",
      "delivery_time"
    ];

    const rows = products
      .filter((p) => p.final_price > 0 && p.is_active && p.stock > 0 && p.brand)
      .map((p) => {
        const categories = p.categories?.map(c => c.name).join(", ") || "";
        return [
          escapeCsv(p.id_provider),
          escapeCsv(p.name),
          escapeCsv(cleanDescription(p.description)),
          escapeCsv(`https://prestige-home.de/de/product/${p.url_key}`),
          escapeCsv(cleanImageLink(p.static_files[0]?.url)),
          escapeCsv(p.stock > 0 ? "in_stock" : "out_of_stock"),
          escapeCsv(p.stock ?? ''),
          escapeCsv(p.final_price.toFixed(2) + " EUR"),
          escapeCsv(p.ean),
          "new",
          "no",
          "adult",
          "no",
          "DE",
          escapeCsv(p.carrier === "dpd" ? "Paketversand" : "Speditionsversand"),
          escapeCsv(p.carrier === "dpd" ? "5.95 EUR" : "35.95 EUR"),
          escapeCsv(p.carrier === "dpd" ? "DPD" : "AMM"),
          escapeCsv(p.color ?? ''),
          escapeCsv(categories),
          escapeCsv(p.length ?? ''),
          escapeCsv(p.width ?? ''),
          escapeCsv(p.height?? ''),
          escapeCsv(p.weight ?? ''),
          escapeCsv(p.materials ?? ''),
          escapeCsv(p.brand.company_name ?? ''),
          escapeCsv(p.brand.company_address ?? ''),
          escapeCsv(p.brand.company_email ?? ''),
          escapeCsv(p.delivery_time ?? ''),
        ].join(",");
      });

    const csv = [headers.join(","), ...rows].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/plain", // trình duyệt sẽ hiển thị trực tiếp
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to generate CSV feed" },
      { status: 500 }
    );
  }
}
