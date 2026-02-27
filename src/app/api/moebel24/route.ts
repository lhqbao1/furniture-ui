import { NextResponse } from "next/server";
import { getProductsFeed } from "@/features/products/api";
import {
  cleanImageLink,
  formatHtmlDescription,
} from "@/hooks/simplify-desciprtion";
import { calculateAvailableStock } from "@/hooks/calculate_available_stock";

function parseTaxRate(tax: unknown): number {
  if (typeof tax === "number") {
    return tax > 1 ? tax / 100 : tax;
  }

  if (typeof tax === "string") {
    const normalized = tax.replace("%", "").replace(",", ".").trim();
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) return 0;
    return parsed > 1 ? parsed / 100 : parsed;
  }

  return 0;
}

export async function GET() {
  try {
    const products = (await getProductsFeed()) ?? [];
    const headers = [
      "Title",
      "SKU_ID",
      "Alternate_Price",
      "Tax",
      "Delivery_Cost",
      "Delivery_Time",
      "Category_Path",
      "Description",
      "Product_URL",
      "Clean_URL",
      "Color",
      "Material",
      "Length",
      "Width",
      "Height",
      "Weight",
      "Product_Image_URL_1",
      "Product_Image_URL_2",
      "Product_Image_URL_3",
      "Product_Image_URL_4",
      "Product_Image_URL_5",
      "EAN",
      "Brand",
      "Availability",
      "MarketplaceActivation",
      "Minimum_Stock_Availability",
      "Delivery_Type",
    ] as const;

    const rows = products
      .filter(
        (p) =>
          Number(p?.final_price ?? 0) > 0 &&
          Boolean(p?.is_active) &&
          calculateAvailableStock(p) > 0 &&
          p.final_price > 0 &&
          p.is_active &&
          p.brand &&
          p.carrier &&
          p.color &&
          p.materials,
      )
      .map((p) => {
        const images = Array.isArray(p?.static_files) ? p.static_files : [];
        const safePrice = Number(p?.final_price ?? 0);
        const safeTax = parseTaxRate(p?.tax);
        const safeStock = calculateAvailableStock(p);

        const categoryPath =
          p.categories
            ?.map((c) => {
              const child = c.children?.[0];
              return child ? `${c.name} > ${child.name}` : c.name;
            })
            .join(", ") ?? "";

        return {
          Title: p?.name?.trim() ?? "",
          SKU_ID: p?.sku ?? "",
          Alternate_Price: safePrice.toFixed(2),
          Tax: (safePrice * safeTax).toFixed(2),
          Delivery_Cost:
            p.carrier === "amm" || p.carrier === "spedition" ? 35.95 : 5.95,
          Delivery_Time: p?.delivery_time ?? "",
          Category_Path: categoryPath,
          Description: formatHtmlDescription(p?.description ?? ""),
          Product_URL: p?.url_key
            ? `https://prestige-home.de/de/product/${p.url_key}`
            : "",
          Clean_URL: p?.url_key ?? "",
          Color: p?.color ?? "",
          Material: Array.isArray(p?.materials)
            ? p.materials
                .map((material) => material?.name ?? "")
                .filter(Boolean)
                .join(", ")
            : typeof p?.materials === "string"
              ? p.materials
              : "",
          Length: Number(p?.length ?? 0) > 0 ? Number(p?.length) * 10 : "",
          Width: Number(p?.width ?? 0) > 0 ? Number(p?.width) * 10 : "",
          Height: Number(p?.height ?? 0) > 0 ? Number(p?.height) * 10 : "",
          Weight: Number(p?.weight ?? 0) > 0 ? Number(p?.weight) * 1000 : "",
          Product_Image_URL_1: images[0]?.url
            ? cleanImageLink(images[0].url)
            : "",
          Product_Image_URL_2: images[1]?.url
            ? cleanImageLink(images[1].url)
            : "",
          Product_Image_URL_3: images[2]?.url
            ? cleanImageLink(images[2].url)
            : "",
          Product_Image_URL_4: images[3]?.url
            ? cleanImageLink(images[3].url)
            : "",
          Product_Image_URL_5: images[4]?.url
            ? cleanImageLink(images[4].url)
            : "",
          EAN: p?.ean ?? "",
          Brand: p?.brand?.name ?? "",
          Availability: safeStock,
          MarketplaceActivation: 1,
          Minimum_Stock_Availability: 1,
          Delivery_Type:
            p.carrier === "amm" || p.carrier === "spedition"
              ? "Spedition"
              : "Paket",
        };
      });

    // Convert to CSV
    const header = headers.join(",");
    const csvRows = rows.map((r) =>
      headers
        .map((field) => r[field] ?? "")
        .map((value) => `"${String(value).replace(/"/g, '""')}"`) // escape CSV syntax
        .join(","),
    );

    const csv = [header, ...csvRows].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=home-tiger.csv",
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
