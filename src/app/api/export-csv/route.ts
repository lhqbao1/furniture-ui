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
      "categories"
    ];

    const rows = products
      .filter((p) => p.final_price > 0 && p.is_active)
      .map((p) => {
        const categories = p.categories?.map(c => c.name).join(", ") || "";
        const colors = p.options
          .filter((opt) => opt.variant_name?.toLowerCase() === "color")
          .map((opt) => opt.label)
          .join(", ");
        return [
          escapeCsv(p.id_provider),
          escapeCsv(p.name.trim()),
          escapeCsv(cleanDescription(p.description)),
          escapeCsv(`https://prestige-home.de/product${p.categories && p.categories.length > 0 ? `/${p.categories[0].slug}` : ''}/${p.id}`),
          escapeCsv(cleanImageLink(p.static_files[0]?.url)),
          escapeCsv(p.stock > 0 ? "in_stock" : "out_of_stock"),
          escapeCsv(p.final_price.toFixed(2) + " EUR"),
          escapeCsv(p.ean),
          "new",
          "no",
          "adult",
          "no",
          "DE",
          "Standard",
          escapeCsv(p.carrier === "dpd" ? "5.95 EUR" : "35.95 EUR"),
          escapeCsv(p.carrier === "dpd" ? "DPD" : "AMM"),
          escapeCsv(colors),
          escapeCsv(categories)
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
