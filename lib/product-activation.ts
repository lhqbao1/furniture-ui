type ActivationProductLike = {
  static_files?: unknown[] | null;
  name?: string | null;
  final_price?: number | string | null;
  brand?: unknown;
  brand_id?: string | null;
  delivery_time?: string | null;
  carrier?: string | null;
  categories?: unknown[] | null;
  category_ids?: string[] | null;
  sku?: string | null;
  ean?: string | null;
  description?: string | null;
};

const hasNonEmptyString = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0;

export function getProductActivationMissingFields(
  product: ActivationProductLike,
): string[] {
  const missingFields: string[] = [];

  if (!Array.isArray(product.static_files) || product.static_files.length === 0) {
    missingFields.push("Images");
  }

  if (!hasNonEmptyString(product.name)) missingFields.push("Product name");
  if (!product.final_price) missingFields.push("Final price");
  if (!product.brand && !hasNonEmptyString(product.brand_id)) {
    missingFields.push("Brand");
  }
  if (!hasNonEmptyString(product.delivery_time)) {
    missingFields.push("Delivery time");
  }
  if (!hasNonEmptyString(product.carrier)) missingFields.push("Carrier");

  const hasCategories =
    (Array.isArray(product.categories) && product.categories.length > 0) ||
    (Array.isArray(product.category_ids) && product.category_ids.length > 0);
  if (!hasCategories) missingFields.push("Categories");

  if (!hasNonEmptyString(product.sku)) missingFields.push("Product sku");
  if (!hasNonEmptyString(product.ean)) missingFields.push("Product ean");
  if (!hasNonEmptyString(product.description)) {
    missingFields.push("Product description");
  }

  return missingFields;
}
