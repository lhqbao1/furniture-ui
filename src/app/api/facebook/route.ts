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
      "id",
      "title",
      "description",
      "availability",
      "condition",
      "price",
      "link",
      "image_link",
      "brand",
      "quantity_to_sell_on_facebook",
      "color",
      "material",
      "shipping",
      "gtin",
    ];

    const rows = products
      .filter((p) => p.final_price > 0 && p.is_active && p.stock > 0 && p.brand)
      .map((p) => {
        const categories = p.categories?.map((c) => c.name).join(", ") || "";
        return [
          escapeCsv(p.id_provider),
          escapeCsv(p.name),
          escapeCsv(cleanDescription(p.description)),
          escapeCsv(p.stock > 0 ? "in stock" : "out of stock"),
          "new",
          escapeCsv(p.final_price.toFixed(2) + " EUR"),
          escapeCsv(`https://prestige-home.de/de/product/${p.url_key}`),
          escapeCsv(cleanImageLink(p.static_files[0]?.url)),
          escapeCsv(p.brand.company_name ?? ""),
          escapeCsv(p.stock ?? ""),
          escapeCsv(p.color ?? ""),
          escapeCsv(p.materials ?? ""),
          escapeCsv(
            p.carrier === "dpd"
              ? "DE:::Paketversand:5.95 EUR"
              : "DE:::Speditionsversand:35.95 EUR",
          ),
          escapeCsv(p.ean),
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
      { status: 500 },
    );
  }
}
