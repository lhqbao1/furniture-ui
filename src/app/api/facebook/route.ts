import { NextResponse } from "next/server";
import { getProductsFeed } from "@/features/products/api";
import { cleanDescription, cleanImageLink } from "@/hooks/simplify-desciprtion";
import { calculateAvailableStock } from "@/hooks/calculate_available_stock";

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

    const hasRequiredFields = (p: unknown) => {
      if (!p || typeof p !== "object") return false;
      const product = p as {
        id_provider?: string;
        name?: string;
        url_key?: string;
        brand?: { name?: string };
        static_files?: unknown[];
      };
      return (
        typeof product.id_provider === "string" &&
        product.id_provider.trim().length > 0 &&
        typeof product.name === "string" &&
        product.name.trim().length > 0 &&
        typeof product.url_key === "string" &&
        product.url_key.trim().length > 0 &&
        typeof product.brand?.name === "string" &&
        product.brand.name.trim().length > 0 &&
        Array.isArray(product.static_files)
      );
    };

    let skippedProducts = 0;

    const rows = products.flatMap((p) => {
      if (!hasRequiredFields(p) || p.final_price <= 0 || !p.is_active) {
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
          escapeCsv(p.name),
          escapeCsv(cleanDescription(p.description)),
          escapeCsv(availableStock > 0 ? "in stock" : "out of stock"),
          "new",
          escapeCsv(p.final_price.toFixed(2) + " EUR"),
          escapeCsv(
            p.brand
              ? p.brand.name.toLowerCase() === "econelo"
                ? `https://econelo.de/produkt/${p.url_key}`
                : `https://prestige-home.de/de/product/${p.url_key}`
              : `https://prestige-home.de/de/product/${p.url_key}`,
          ),
          escapeCsv(cleanImageLink(p.static_files[0]?.url)),
          escapeCsv(p.brand.company_name ?? ""),
          escapeCsv(availableStock),
          escapeCsv(p.color ?? ""),
          escapeCsv(p.materials ?? ""),
          escapeCsv(
            p.carrier === "dpd"
              ? "DE:::Paketversand:5.95 EUR"
              : "DE:::Speditionsversand:35.95 EUR",
          ),
          escapeCsv(p.ean),
        ].join(",")];
      } catch (error) {
        skippedProducts += 1;
        console.warn("Skip invalid Facebook product row:", {
          id_provider: p?.id_provider,
          error,
        });
        return [];
      }
    });

    if (skippedProducts > 0) {
      console.warn(`Facebook feed skipped ${skippedProducts} invalid products.`);
    }

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
