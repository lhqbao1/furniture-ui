import { NextResponse } from "next/server";
import { cleanDescription } from "@/hooks/simplify-desciprtion";
import { getAllProductsSelect } from "@/features/product-group/api";
import { calculateAvailableStock } from "@/hooks/calculate_available_stock";
import { ProductItem } from "@/types/products";

// Escape CSV value
const escapeCsv = (value?: string | number) => {
  if (value === undefined || value === null) return "";
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`; // ALWAYS quote → safest
};

const hasCsvFieldValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "number") return Number.isFinite(value);
  return String(value).trim().length > 0;
};

const REQUIRED_CSV_FIELD_INDEXES = [
  0, // EAN (GTIN14)
  1, // offer_id
  2, // name
  3, // description
  4, // deeplink
  5, // brand
  6, // color
  12, // material
  13, // Bildlink_1
  23, // delivery_includes
  24, // stock_amount
  25, // price
  26, // delivery_time
  27, // shipping_mode
  28, // shipping_cost
];

const getOneMonthFromNow = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date;
};

const hasIncomingStockWithinOneMonth = (product: ProductItem) => {
  const now = new Date();
  const oneMonthFromNow = getOneMonthFromNow();

  return (product.inventory_pos ?? []).some((item) => {
    const quantity = Number(item?.quantity) || 0;
    if (quantity <= 0 || !item?.list_delivery_date) return false;

    const deliveryDate = new Date(item.list_delivery_date);
    if (Number.isNaN(deliveryDate.getTime())) return false;

    return deliveryDate > now && deliveryDate <= oneMonthFromNow;
  });
};

const getDiscountedFinalPrice = (finalPrice: unknown) => {
  const price = Number(finalPrice) || 0;
  return Math.max(0, +(price * 0.9).toFixed(2));
};

export async function GET() {
  try {
    const products = await getAllProductsSelect({
      is_econelo: false,
      all_products: true,
      supplier_id: "prestige_home",
    });

    const formatEuro = (value: number) => value.toFixed(2).replace(".", ",");

    const html = (value: string) => `<span>${value}</span>`;

    // Header CSV
    const headers = [
      "EAN (GTIN14)",
      "offer_id",
      "name",
      "description",
      "deeplink",
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
      "manufacturer_phone_number",
    ];

    const hasRequiredFields = (p: ProductItem) =>
      p &&
      typeof p.color === "string" &&
      p.color.trim().length > 0 &&
      typeof p.materials === "string" &&
      p.materials.trim().length > 0 &&
      typeof p.ean === "string" &&
      p.ean.trim().length > 0 &&
      typeof p.id_provider === "string" &&
      p.id_provider.trim().length > 0 &&
      typeof p.name === "string" &&
      p.name.trim().length > 0 &&
      typeof p.url_key === "string" &&
      p.url_key.trim().length > 0 &&
      !!p.brand &&
      typeof p.brand.name === "string" &&
      p.brand.name.trim().length > 0 &&
      typeof p.component === "string" &&
      p.component.trim().length > 0 &&
      typeof p.carrier === "string" &&
      p.carrier.trim().length > 0 &&
      Array.isArray(p.static_files) &&
      p.static_files.some((file) => hasCsvFieldValue(file?.url));

    let skippedProducts = 0;

    const rows = products.flatMap((p) => {
      if (
        !hasRequiredFields(p) ||
        getDiscountedFinalPrice(p.final_price) <= 0 ||
        p.brand.name.toLowerCase() === "prestige works"
      ) {
        skippedProducts += 1;
        return [];
      }

      try {
        const availableStock = Number(calculateAvailableStock(p));
        const stockAmount =
          Number.isFinite(availableStock) && availableStock > 0
            ? Math.floor(availableStock)
            : 0;

        if (stockAmount <= 0 && !hasIncomingStockWithinOneMonth(p)) {
          skippedProducts += 1;
          return [];
        }

        const discountedFinalPrice = getDiscountedFinalPrice(p.final_price);
        const size = `${p.height} x ${p.width} x ${p.length} cm`;
        const lyingSurface = `${p.width} x ${p.length} cm`;
        const color = p.color.replace(/\s+(and|und)\s+/gi, "/");
        const imageUrls = (p.static_files ?? [])
          .map((file) => String(file?.url ?? "").trim())
          .filter(Boolean)
          .slice(0, 10);

        const rowValues: Array<string | number> = [
          p.ean ?? "",
          p.id_provider ?? "",
          p.name ?? "",
          html(
            `<div>${cleanDescription(p.description || "")}<div>Artikel-ID: ${
              p.id_provider
            }</div></div>`,
          ),
          p.brand.name.toLowerCase() === "econelo"
            ? `https://econelo.de/produkt/${p.url_key}?utm_source=C24&aff=g7Nn7Xm40R`
            : `https://prestige-home.de/de/product/${p.url_key}?utm_source=C24&aff=g7Nn7Xm40R`,
          p.brand.name ?? "",
          p.color ? color.toUpperCase() : "",
          size,
          p.height ?? "",
          p.width ?? "",
          p.length ?? "",
          lyingSurface,
          p.materials ?? "",
          imageUrls[0] ?? "",
          imageUrls[1] ?? "",
          imageUrls[2] ?? "",
          imageUrls[3] ?? "",
          imageUrls[4] ?? "",
          imageUrls[5] ?? "",
          imageUrls[6] ?? "",
          imageUrls[7] ?? "",
          imageUrls[8] ?? "",
          imageUrls[9] ?? "",
          p.component ?? "",
          stockAmount,
          `${formatEuro(discountedFinalPrice)} €`,
          `${p.delivery_time} Werktage`,
          p.carrier === "amm" || p.carrier === "spedition"
            ? "Spedition"
            : "Paket",
          p.carrier === "amm" || p.carrier === "spedition"
            ? `${formatEuro(35.95)} €`
            : `${formatEuro(5.95)} €`,
          p.brand.name ?? "",
          p.brand.company_address ?? "",
          p.brand.company_postal_code ?? "",
          p.brand.company_city ?? "",
          p.brand.company_country ?? "",
          p.brand.company_email ?? "",
          p.brand.company_phone ?? "",
        ];

        const hasRequiredCsvFields =
          rowValues.length === headers.length &&
          REQUIRED_CSV_FIELD_INDEXES.every((index) =>
            hasCsvFieldValue(rowValues[index]),
          );

        if (!hasRequiredCsvFields) {
          skippedProducts += 1;
          return [];
        }

        return [rowValues.map((value) => escapeCsv(value)).join(",")];
      } catch (error) {
        skippedProducts += 1;
        console.warn("Skip invalid Check24 product row:", {
          id_provider: p?.id_provider,
          error,
        });
        return [];
      }
    });

    if (skippedProducts > 0) {
      console.warn(`Check24 feed skipped ${skippedProducts} invalid products.`);
    }

    const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=check24-feed.csv",
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
