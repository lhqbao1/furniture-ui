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
      "EAN (GTIN14)",
      "offer_id",
      "name",
      "description",
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
    ];

    const rows = products
      .filter((p) => p.final_price > 0 && p.is_active && p.stock > 0 && p.brand)
      .map((p) => {
        const categories = p.categories?.map((c) => c.name).join(", ") || "";
        const size = `${p.height} x ${p.width} x ${p.length} cm`;
        const lyingSurface = `${p.width} x ${p.length} cm`;
        return [
          escapeCsv(p.ean),
          escapeCsv(p.id_provider),
          escapeCsv(p.name),
          escapeCsv(cleanDescription(p.description)),
          escapeCsv(p.brand.name ?? ""),
          escapeCsv(p.color),
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
          escapeCsv("1 pieces"),
          escapeCsv(p.stock ?? ""),
          escapeCsv(p.final_price.toFixed(2)),
          escapeCsv(`${p.delivery_time} Werktage`),
          escapeCsv(p.carrier === "dpd" ? "Paket" : "Spedition"),
          escapeCsv(p.carrier === "dpd" ? 5.95 : 35.95),
          escapeCsv(p.brand.name ?? ""),
          escapeCsv(p.brand.company_address ?? ""),
          escapeCsv(p.brand.company_postal_code ?? ""),
          escapeCsv(p.brand.company_city ?? ""),
          escapeCsv(p.brand.company_country ?? ""),
          escapeCsv(p.brand.company_email ?? ""),
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
