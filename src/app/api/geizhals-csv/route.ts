import { NextResponse } from "next/server";
import { getProductsFeed } from "@/features/products/api";
import { cleanDescription, cleanImageLink } from "@/hooks/simplify-desciprtion";

export async function GET() {
  try {
    const products = await getProductsFeed();

    const rows = products
      .filter((p) => p.final_price > 0 && p.is_active)
      .map((p) => {
        const images = p.static_files || [];
        const largeImage = images[0] ? cleanImageLink(images[0].url) : "";

        const categoryPath =
          p.categories
            ?.map((c) => {
              const child = c.children?.[0];
              return child ? `${c.name} > ${child.name}` : c.name;
            })
            .join(", ") ?? "";

        const categories =
          p.categories?.map((c) => c.name).join(" > ") || "General";

        return {
          Artikelnummer: p.id_provider,
          Produktbezeichnung: p.name.trim(),
          Herstellername: p.brand?.name || "Prestige Home",
          Preis: p.final_price.toFixed(2),
          Deeplink: `https://prestige-home.de/product/${p.url_key}`,
          EAN: p.ean ?? "",
          Verfügbarkeit: categoryPath,
          Kategorie: categories,
          Bild: largeImage,
          Beschreibung: cleanDescription(p.description ?? ""),
        };
      });

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
