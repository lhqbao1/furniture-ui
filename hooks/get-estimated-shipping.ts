import { useMemo } from "react";
import { calculateAvailableStock } from "./calculate_available_stock";
import { calculateIncomingStockSummary } from "./calculate_incoming_stock";
import { ProductItem } from "@/types/products";

/* ---------- helpers ---------- */

type IncomingInventoryItem = {
  quantity?: unknown;
  list_delivery_date?: unknown;
};

type NormalizedIncomingInventoryItem = {
  quantity: number;
  date: Date;
};

const normalizeFutureIncomingInventory = (
  inventory: IncomingInventoryItem[],
): NormalizedIncomingInventoryItem[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const normalized = (inventory ?? []).flatMap((item) => {
    const quantity = Number(item?.quantity ?? 0);
    if (!Number.isFinite(quantity) || quantity <= 0) return [];
    if (!item?.list_delivery_date) return [];

    const date = new Date(String(item.list_delivery_date));
    if (Number.isNaN(date.getTime())) return [];

    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    if (compareDate < today) return [];

    return [{ quantity, date }];
  });

  return normalized.sort((a, b) => a.date.getTime() - b.date.getTime());
};

export function getLatestInventory(inventory: IncomingInventoryItem[]) {
  const futureItems = normalizeFutureIncomingInventory(inventory);
  if (futureItems.length === 0) return null;

  return futureItems[0];
}

export function getIncomingDateForRequiredQuantity(
  inventory: IncomingInventoryItem[],
  requiredQuantity: number,
): Date | null {
  const futureItems = normalizeFutureIncomingInventory(inventory);
  if (futureItems.length === 0) return null;

  if (!Number.isFinite(requiredQuantity) || requiredQuantity <= 0) {
    return futureItems[0]?.date ?? null;
  }

  let cumulativeQuantity = 0;

  for (const item of futureItems) {
    cumulativeQuantity += item.quantity;
    if (cumulativeQuantity >= requiredQuantity) {
      return item.date;
    }
  }

  // If future incoming is not enough yet, use the latest known incoming date.
  return futureItems[futureItems.length - 1]?.date ?? null;
}

export function getDeliveryDayRange(
  deliveryTime?: string,
): { min: number; max: number } | null {
  if (!deliveryTime) return null;

  const parts = deliveryTime
    .split("-")
    .map((d) => Number(d.trim()))
    .filter((d) => !isNaN(d));

  if (parts.length === 1) {
    return { min: parts[0], max: parts[0] };
  }

  if (parts.length >= 2) {
    return {
      min: Math.min(...parts),
      max: Math.max(...parts),
    };
  }

  return null;
}

export function addBusinessDays(startDate: Date, businessDays: number) {
  const result = new Date(startDate);
  let addedDays = 0;

  while (addedDays < businessDays) {
    result.setDate(result.getDate() + 1);

    const day = result.getDay();
    if (day !== 0 && day !== 6) {
      addedDays++;
    }
  }

  return result;
}

export function addCalendarDays(startDate: Date, days: number) {
  const result = new Date(startDate);
  result.setDate(result.getDate() + days);
  return result;
}

interface CalculateProductDeliveryRangeOptions {
  inventoryPo?: IncomingInventoryItem[] | null;
  referenceDate?: Date;
}

export function calculateProductDeliveryRange(
  product?: Partial<ProductItem> | null,
  options: CalculateProductDeliveryRangeOptions = {},
): { from: Date; to: Date } | null {
  if (!product) return null;

  const deliveryRange = getDeliveryDayRange(product.delivery_time);
  if (!deliveryRange) return null;

  const currentStock = calculateAvailableStock(product);
  const incomingSummary = calculateIncomingStockSummary(product, {
    inventoryPo: options.inventoryPo,
    referenceDate: options.referenceDate,
  });
  const isBundleProduct = (product.bundles?.length ?? 0) > 0;

  const incomingInventorySource =
    Array.isArray(options.inventoryPo) && options.inventoryPo.length > 0
      ? options.inventoryPo
      : product.inventory_pos ?? [];

  const nextIncomingDate = isBundleProduct
    ? incomingSummary.latestIncomingDate
    : (getIncomingDateForRequiredQuantity(
        incomingInventorySource,
        Math.abs(currentStock) + 1,
      ) ?? incomingSummary.nearestIncomingDate);

  if (currentStock > 0) {
    const today = options.referenceDate ?? new Date();
    return {
      from: addCalendarDays(today, deliveryRange.min),
      to: addCalendarDays(today, deliveryRange.max),
    };
  }

  if (!nextIncomingDate) {
    const today = options.referenceDate ?? new Date();
    return {
      from: addCalendarDays(today, deliveryRange.min),
      to: addCalendarDays(today, deliveryRange.max),
    };
  }

  return {
    from: addBusinessDays(nextIncomingDate, deliveryRange.min),
    to: addBusinessDays(nextIncomingDate, deliveryRange.max),
  };
}

/* ---------- hook ---------- */

interface UseDeliveryEstimateParams {
  stock: number;
  inventory?: IncomingInventoryItem[];
  deliveryTime?: string;
}

export const useDeliveryEstimate = ({
  stock,
  inventory,
  deliveryTime,
}: UseDeliveryEstimateParams) => {
  return useMemo(() => {
    const deliveryRange = getDeliveryDayRange(deliveryTime);
    if (!deliveryRange) return null;

    let startDate: Date | null = null;

    if (stock > 0) {
      startDate = new Date();
    } else {
      const requiredIncomingQuantity = Math.abs(stock) + 1;
      const incomingDate = getIncomingDateForRequiredQuantity(
        inventory ?? [],
        requiredIncomingQuantity,
      );
      if (incomingDate) {
        startDate = new Date(incomingDate);
      }
    }

    if (!startDate) return null;

    return {
      from: addBusinessDays(startDate, deliveryRange.min),
      to: addBusinessDays(startDate, deliveryRange.max),
    };
  }, [stock, inventory, deliveryTime]);
};

export function calculateDeliveryEstimate({
  stock,
  inventory,
  deliveryTime,
}: UseDeliveryEstimateParams): { from: Date; to: Date } | null {
  const deliveryRange = getDeliveryDayRange(deliveryTime);
  if (!deliveryRange) return null;

  let startDate: Date | null = null;

  // CASE 1: còn hàng
  if (stock > 0) {
    startDate = new Date();
  }

  // CASE 2: hết hàng hoặc thiếu stock do result_stock > stock
  if (stock <= 0) {
    const requiredIncomingQuantity = Math.abs(stock) + 1;
    const incomingDate = getIncomingDateForRequiredQuantity(
      inventory ?? [],
      requiredIncomingQuantity,
    );

    if (incomingDate) {
      startDate = new Date(incomingDate);
    }
  }

  if (!startDate) return null;

  return {
    from: addBusinessDays(startDate, deliveryRange.min),
    to: addBusinessDays(startDate, deliveryRange.max),
  };
}
