import type { MarketplaceProduct, ProductItem } from "@/types/products";

export type SupportedMarketplace = "ebay" | "amazon" | "kaufland";

const NORMA_OWNER_BUSINESS_NAME = "NORMA24 Online-Shop GmbH & Co. KG";
const NORMA_PACKAGE_FALLBACK = {
  length: 120,
  width: 80,
  height: 60,
  weight: 8,
};

type GuardField = {
  ok: boolean;
  label: string;
};

const hasValue = (value: unknown) => Boolean(value);

export const getMarketplaceRecord = (
  product: ProductItem,
  marketplace: SupportedMarketplace,
): MarketplaceProduct | undefined =>
  product.marketplace_products?.find(
    (item) => String(item.marketplace ?? "").toLowerCase() === marketplace,
  );

const getMarketplaceHandlingTime = (
  product: ProductItem,
  marketplace: SupportedMarketplace,
) => getMarketplaceRecord(product, marketplace)?.handling_time;

const getAmazonCountryOfOrigin = (product: ProductItem) =>
  getMarketplaceRecord(product, "amazon")?.country_of_origin;

const getAmazonResolvedDimensions = (product: ProductItem) => {
  const hasPackageInformation =
    Array.isArray(product.packages) && product.packages.length > 0;
  const isNormaOwner =
    product.owner?.business_name === NORMA_OWNER_BUSINESS_NAME;
  const useNormaFallback = isNormaOwner && !hasPackageInformation;

  return {
    hasPackageInformation,
    useNormaFallback,
    resolvedLength: useNormaFallback
      ? NORMA_PACKAGE_FALLBACK.length
      : product.length,
    resolvedWidth: useNormaFallback
      ? NORMA_PACKAGE_FALLBACK.width
      : product.width,
    resolvedHeight: useNormaFallback
      ? NORMA_PACKAGE_FALLBACK.height
      : product.height,
    resolvedWeight: useNormaFallback
      ? NORMA_PACKAGE_FALLBACK.weight
      : product.weight,
  };
};

export const getEbaySyncGuardErrors = (product: ProductItem): string[] => {
  const checks: GuardField[] = [
    { ok: hasValue(product.ean), label: "EAN" },
    { ok: hasValue(product.name), label: "Name" },
    { ok: hasValue(product.sku), label: "SKU" },
    { ok: hasValue(product.description), label: "Description" },
    {
      ok: Array.isArray(product.static_files) && product.static_files.length > 0,
      label: "Images",
    },
    { ok: hasValue(product.final_price), label: "Final price" },
    { ok: hasValue(product.carrier), label: "Carrier" },
    { ok: hasValue(product.brand), label: "Brand" },
  ];

  return checks.filter((field) => !field.ok).map((field) => `Missing ${field.label}`);
};

export const getKauflandSyncGuardErrors = (
  product: ProductItem,
): string[] => {
  const checks: GuardField[] = [
    { ok: hasValue(product.ean), label: "EAN" },
    { ok: hasValue(product.name), label: "Name" },
    { ok: hasValue(product.sku), label: "SKU" },
    { ok: hasValue(product.description), label: "Description" },
    {
      ok: Array.isArray(product.static_files) && product.static_files.length > 0,
      label: "Images",
    },
    { ok: hasValue(product.final_price), label: "Final price" },
    { ok: hasValue(product.carrier), label: "Carrier" },
    { ok: hasValue(product.brand), label: "Brand" },
    { ok: hasValue(product.materials), label: "Materials" },
    { ok: hasValue(product.color), label: "Color" },
    {
      ok: hasValue(getMarketplaceHandlingTime(product, "kaufland")),
      label: "Handling time (Kaufland)",
    },
  ];

  return checks.filter((field) => !field.ok).map((field) => `Missing ${field.label}`);
};

export const getAmazonSyncGuardErrors = (product: ProductItem): string[] => {
  const {
    hasPackageInformation,
    useNormaFallback,
    resolvedLength,
    resolvedWidth,
    resolvedHeight,
    resolvedWeight,
  } = getAmazonResolvedDimensions(product);

  const checks: GuardField[] = [
    { ok: hasValue(product.ean), label: "EAN" },
    { ok: hasValue(product.name), label: "Name" },
    { ok: hasValue(product.sku), label: "SKU" },
    { ok: hasValue(product.description), label: "Description" },
    {
      ok: Array.isArray(product.static_files) && product.static_files.length > 0,
      label: "Images",
    },
    {
      ok: hasPackageInformation || useNormaFallback,
      label: "Packages information",
    },
    { ok: hasValue(product.final_price), label: "Final price" },
    { ok: hasValue(product.carrier), label: "Carrier" },
    { ok: hasValue(product.brand), label: "Brand" },
    { ok: hasValue(resolvedLength), label: "Length" },
    { ok: hasValue(resolvedWidth), label: "Width" },
    { ok: hasValue(resolvedHeight), label: "Height" },
    { ok: hasValue(resolvedWeight), label: "Net weight" },
    {
      ok: hasValue(getAmazonCountryOfOrigin(product)),
      label: "Country of origin (Amazon)",
    },
    {
      ok: hasValue(getMarketplaceHandlingTime(product, "amazon")),
      label: "Handling time (Amazon)",
    },
  ];

  return checks.filter((field) => !field.ok).map((field) => `Missing ${field.label}`);
};

export const getMarketplaceSyncGuardErrors = (
  product: ProductItem,
  marketplace: SupportedMarketplace,
): string[] => {
  if (marketplace === "ebay") return getEbaySyncGuardErrors(product);
  if (marketplace === "amazon") return getAmazonSyncGuardErrors(product);
  return getKauflandSyncGuardErrors(product);
};
