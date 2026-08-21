import { defaultValues } from "@/lib/schema/product";
import { CategoryResponse } from "@/types/categories";
import { ProductItem, ProductPackage } from "@/types/products";

const toFiniteNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const pickFiniteNumber = (
  source: Record<string, unknown>,
  keys: string[],
) => {
  for (const key of keys) {
    const value = toFiniteNumber(source[key]);

    if (value > 0) return value;
  }

  return 0;
};

const getPreferredPackageSize = (product?: Partial<ProductItem> | null) => {
  const firstPackage = Array.isArray(product?.packages)
    ? (product?.packages[0] as ProductPackage | undefined)
    : undefined;

  if (firstPackage) {
    const packageRecord = firstPackage as unknown as Record<string, unknown>;

    return {
      length: pickFiniteNumber(packageRecord, ["length", "package_length"]),
      width: pickFiniteNumber(packageRecord, ["width", "package_width"]),
      height: pickFiniteNumber(packageRecord, ["height", "package_height"]),
      weight: pickFiniteNumber(packageRecord, ["weight", "package_weight"]),
    };
  }

  const productRecord = (product ?? {}) as Record<string, unknown>;

  return {
    length: pickFiniteNumber(productRecord, ["length", "package_length"]),
    width: pickFiniteNumber(productRecord, ["width", "package_width"]),
    height: pickFiniteNumber(productRecord, ["height", "package_height"]),
    weight: pickFiniteNumber(productRecord, ["weight", "package_weight"]),
  };
};

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
    brand_id: productValues.brand ? String(productValues.brand.id) : null,
    bundles:
      productValues.bundles?.map((b) => {
        const preferredPackage = getPreferredPackageSize(b.bundle_item);

        return {
          product_id: b.bundle_item.id,
          quantity: b.quantity,
          length: preferredPackage.length,
          width: preferredPackage.width,
          height: preferredPackage.height,
          weight: preferredPackage.weight,
        };
      }) || [],
  };
};
