import { NextResponse } from "next/server";
import { calculateAvailableStock } from "@/hooks/calculate_available_stock";
import { getAllProductsSelect } from "@/features/product-group/api";

export async function GET() {
  try {
    const products = await getAllProductsSelect({
      all_products: true,
      is_econelo: true,
      supplier_id: "prestige_home",
    });

    const hasRequiredFields = (p: unknown) => {
      if (!p || typeof p !== "object") return false;
      const product = p as {
        id_provider?: string;
        name?: string;
        url_key?: string;
      };
      return (
        typeof product.id_provider === "string" &&
        product.id_provider.trim().length > 0 &&
        typeof product.name === "string" &&
        product.name.trim().length > 0 &&
        typeof product.url_key === "string" &&
        product.url_key.trim().length > 0
      );
    };

    let skippedProducts = 0;

    const formatPriceWithComma = (value: number) =>
      Number(value).toFixed(2).replace(".", ",");

    const rows = products.flatMap((p) => {
      if (!hasRequiredFields(p) || p.final_price <= 0 || !p.is_active) {
        skippedProducts += 1;
        return [];
      }

      try {
        const availableStock = calculateAvailableStock(p);
        const calculatedStock = Math.floor(availableStock * 0.7);

        if (calculatedStock <= 0) {
          skippedProducts += 1;
          return [];
        }

        return [
          {
            ean_code: String(p.ean ?? ""),
            price_incl_vat: formatPriceWithComma(p.final_price),
            stock: calculatedStock,
            origin: "own",
          },
        ];
      } catch (error) {
        skippedProducts += 1;
        console.warn("Skip invalid Geizhals CSV product row:", {
          id_provider: p?.id_provider,
          error,
        });
        return [];
      }
    });

    if (skippedProducts > 0) {
      console.warn(
        `Geizhals CSV feed skipped ${skippedProducts} invalid products.`,
      );
    }

    if (rows.length === 0) {
      return new Response("", {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=products.csv",
        },
      });
    }

    // Convert to CSV:
    // - delimiter: ;
    // - quote char: "
    // - line ending: CRLF
    const header = Object.keys(rows[0]).join(";");
    const csvRows = rows.map((r) =>
      Object.values(r)
        .map((value) => `"${String(value).replace(/"/g, '""')}"`) // escape CSV syntax
        .join(";"),
    );

    const csv = [header, ...csvRows].join("\r\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=products.csv",
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
