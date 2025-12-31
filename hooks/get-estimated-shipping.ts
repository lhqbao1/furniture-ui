import { useMemo } from "react";

/* ---------- helpers ---------- */

export function getLatestInventory(inventory: any[]) {
  if (!inventory || inventory.length === 0) return null;

  return inventory.reduce((latest, item) => {
    if (!latest) return item;
    return new Date(item.date_received) > new Date(latest.date_received)
      ? item
      : latest;
  }, null);
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

/* ---------- hook ---------- */

interface UseDeliveryEstimateParams {
  stock: number;
  inventory?: any[];
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

    const latestInventory = getLatestInventory(inventory ?? []);

    let startDate: Date | null = null;

    // CASE 1: còn hàng
    if (stock > 0) {
      startDate = new Date();
    }

    // CASE 2: hết hàng nhưng có inventory sắp về
    if (stock === 0 && latestInventory) {
      startDate = new Date(latestInventory.date_received);
    }

    if (!startDate) return null;

    return {
      from: addBusinessDays(startDate, deliveryRange.min),
      to: addBusinessDays(startDate, deliveryRange.max),
    };
  }, [stock, inventory, deliveryTime]);
};
