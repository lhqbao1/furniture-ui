"use client";

import { format, getISOWeek } from "date-fns";
import { calculateAvailableStock } from "@/hooks/calculate_available_stock";
import { ProductItem } from "@/types/products";

const clean = (val: unknown) =>
  val === null || val === undefined ? "" : val;

export const getIncomingStockExportLabel = (product: ProductItem): string => {
  const inventoryPos = product.inventory_pos ?? [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = inventoryPos.filter((item) => {
    if (!item.list_delivery_date) return false;
    const date = new Date(item.list_delivery_date);
    if (Number.isNaN(date.getTime())) return false;
    date.setHours(0, 0, 0, 0);
    return date > today;
  });

  if (!upcoming.length) return "—";

  return upcoming
    .map((item) => {
      const date = item.list_delivery_date
        ? new Date(item.list_delivery_date)
        : null;
      const formattedDate =
        date && !Number.isNaN(date.getTime())
          ? `CW ${String(getISOWeek(date)).padStart(2, "0")} - ${format(
              date,
              "MMMM d",
            )}`
          : "—";

      return `${item.quantity ?? 0} | ${formattedDate}`;
    })
    .join(" ; ");
};

const getMarketplaceStatus = (
  marketplaces: ProductItem["marketplace_products"] | undefined,
  name: string,
) => {
  if (!Array.isArray(marketplaces)) return "not synced";

  const found = marketplaces.find(
    (marketplace) => marketplace.marketplace?.toLowerCase() === name,
  );

  if (!found) return "not synced";
  return found.is_active ? "synced" : "not synced";
};

export const buildProductExportData = (
  data: ProductItem[],
  imageDelimiter = "|",
) => {
  return data.map((product) => {
    const rawTariff = clean(product.tariff_number);
    const tariff =
      rawTariff !== "" && rawTariff !== null && rawTariff !== undefined
        ? Number(rawTariff)
        : null;

    const rawVat = clean(product.tax);
    const vat =
      rawVat && rawVat.includes("%")
        ? Number(rawVat.replace("%", "").trim())
        : null;

    return {
      id: Number(clean(product.id_provider)),
      ean: String(clean(product.ean)),
      status: product.is_active === true ? "ACTIVE" : "INACTIVE",
      brand_name: clean(product.brand?.name),
      supplier_name: clean(
        product.owner?.business_name ?? "Prestige Home",
      ),
      manufacturer_sku: clean(product.sku),
      manufacturing_country: clean(product.manufacture_country),
      customs_tariff_nr: Number.isFinite(tariff) ? tariff : null,
      name: clean(product.name),
      description: clean(product.description),
      technical_description: clean(product.technical_description),
      categories: clean(product.categories?.map((category) => category.code).join(", ")),
      category_name: clean(
        product.categories?.map((category) => category.name).join(", "),
      ),
      unit: clean(product.unit),
      amount_unit: Number(clean(product.amount_unit)),
      delivery_time: clean(product.delivery_time),
      carrier: clean(product.carrier),
      net_purchase_cost: clean(product.cost),
      delivery_cost: clean(product.delivery_cost),
      return_cost: clean(product.return_cost),
      original_price: clean(product.price),
      sale_price: clean(product.final_price),
      shipping_revenue: clean(
        product.carrier === "amm" || product.carrier === "spedition"
          ? 35.95
          : 5.95,
      ),
      vat,
      stock: clean(calculateAvailableStock(product)),
      incoming_stock: getIncomingStockExportLabel(product),
      img_url: clean(
        product.static_files
          ?.map((file) => file.url.replaceAll(" ", "%20"))
          .join(imageDelimiter),
      ),
      length: clean(product.length),
      width: clean(product.width),
      height: clean(product.height),
      weight: clean(product.weight),
      weee_nr: clean(product.weee_nr),
      eek: clean(product.eek),
      SEO_keywords: clean(product.meta_keywords),
      materials: clean(product.materials),
      color: clean(product.color),
      log_length: clean(
        product.packages?.reduce((sum, item) => sum + (item.length || 0), 0),
      ),
      log_width: clean(
        product.packages?.reduce((sum, item) => sum + (item.width || 0), 0),
      ),
      log_height: clean(
        product.packages?.reduce((sum, item) => sum + (item.height || 0), 0),
      ),
      log_weight: clean(
        product.packages?.reduce((sum, item) => sum + (item.weight || 0), 0),
      ),
      benutzerhandbuch: clean(
        product.pdf_files
          ?.filter((file) =>
            file?.title?.toLowerCase?.().includes("benutzerhandbuch"),
          )
          .map((file) => file.url.replaceAll(" ", "%20"))
          .join("|"),
      ),
      sicherheit_information: clean(
        product.pdf_files
          ?.filter((file) =>
            file?.title?.toLowerCase?.().includes("sicherheit"),
          )
          .map((file) => file.url.replaceAll(" ", "%20"))
          .join("|"),
      ),
      aufbauanleitung: clean(
        product.pdf_files
          ?.filter((file) =>
            file?.title?.toLowerCase?.().includes("aufbauanleitung"),
          )
          .map((file) => file.url.replaceAll(" ", "%20"))
          .join("|"),
      ),
      product_link: `https://www.prestige-home.de/de/product/${product.url_key}`,
      amazon: getMarketplaceStatus(product.marketplace_products, "amazon"),
      kaufland: getMarketplaceStatus(product.marketplace_products, "kaufland"),
      ebay: getMarketplaceStatus(product.marketplace_products, "ebay"),
    };
  });
};
