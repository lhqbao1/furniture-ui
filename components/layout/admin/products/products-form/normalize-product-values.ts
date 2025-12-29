import { defaultValues } from "@/lib/schema/product";
import { CategoryResponse } from "@/types/categories";
import { ProductItem } from "@/types/products";

export const normalizeProductValues = (
  productValues?: Partial<ProductItem>,
) => {
  if (!productValues) return defaultValues;

  return {
    ...defaultValues,
    ...productValues,
    category_ids:
      productValues.categories?.map((c: CategoryResponse | number) =>
        typeof c === "object" ? String(c.id) : String(c),
      ) || [],
    brand_id: productValues.brand?.id,
    bundles:
      productValues.bundles?.map((b) => ({
        product_id: b.bundle_item.id,
        quantity: b.quantity,
      })) || [],
  };
};
