import { NextResponse } from "next/server";
import { getProductsFeed } from "@/features/products/api";
import { cleanDescription, cleanImageLink } from "@/hooks/simplify-desciprtion";
import { calculateAvailableStock } from "@/hooks/calculate_available_stock";

export async function GET() {
  try {
    const products = await getProductsFeed();

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

        const images = Array.isArray(p.static_files) ? p.static_files : [];
        const largeImage = images[0]?.url ? cleanImageLink(images[0].url) : "";

        const categoryPath =
          p.categories
            ?.map((c) => {
              const child = c.children?.[0];
              return child ? `${c.name} > ${child.name}` : c.name;
            })
            .join(", ") ?? "";

        const categories =
          p.categories?.map((c) => c.name).join(" > ") || "General";

        return [
          {
            Artikelnummer: p.id_provider,
            Produktbezeichnung: p.name.trim(),
            Herstellername: p.brand?.name || "Prestige Home",
            Preis: p.final_price.toFixed(2),
            Deeplink: p.brand
              ? p.brand.name.toLowerCase() === "econelo"
                ? `https://econelo.de/produkt/${p.url_key}`
                : `https://prestige-home.de/de/product/${p.url_key}`
              : `https://prestige-home.de/de/product/${p.url_key}`,
            EAN: p.ean ?? "",
            Verfügbarkeit: categoryPath,
            Kategorie: categories,
            Bild: largeImage,
            Beschreibung: cleanDescription(p.description ?? ""),
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

    // Convert to CSV
    const header = Object.keys(rows[0]).join(",");
    const csvRows = rows.map((r) =>
      Object.values(r)
        .map((value) => `"${String(value).replace(/"/g, '""')}"`) // escape CSV syntax
        .join(","),
    );

    const csv = [header, ...csvRows].join("\n");

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
