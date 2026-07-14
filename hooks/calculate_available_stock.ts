import { ProductItem } from "@/types/products";

const toNumber = (value: unknown): number =>
  typeof value === "number" ? value : Number(value) || 0;

const hasValue = (value: unknown): boolean =>
  value !== null && value !== undefined && value !== "";

const toFiniteNumber = (value: unknown): number | null => {
  if (!hasValue(value)) return null;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const calculateOwnAvailableStock = (
  product?: Partial<ProductItem> | null,
): number => {
  if (!product) return 0;
  const stock = toNumber(product.stock);
  const resultStock = toNumber(product.result_stock);
  return stock - Math.abs(resultStock);
};

export const calculateAvailableStock = (
  product?: Partial<ProductItem> | null,
): number => {
  if (!product) return 0;

  return calculateOwnAvailableStock(product);
};

export type AvailableStockDisplayState = {
  value: number | null;
  error: string | null;
};

export const resolveAvailableStockForDisplay = (
  product?: Partial<ProductItem> | null,
): AvailableStockDisplayState => {
  if (!product) {
    return {
      value: null,
      error: "Missing product stock data",
    };
  }

  const computedStock = toFiniteNumber(product.computed_stock);
  if (computedStock !== null) {
    return {
      value: computedStock,
      error: null,
    };
  }

  const stock = toFiniteNumber(product.stock);
  const reservedStock = toFiniteNumber(product.reserved_stock);

  if (stock === null) {
    return {
      value: null,
      error: "Missing stock",
    };
  }

  if (reservedStock === null) {
    return {
      value: null,
      error: "Missing reserved_stock",
    };
  }

  return {
    value: stock - reservedStock,
    error: null,
  };
};
