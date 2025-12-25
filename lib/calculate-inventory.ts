import { InventoryItem } from "@/types/products";

export const getTotalIncomingStock = (inventory?: InventoryItem[]): number => {
  if (!inventory || inventory.length === 0) return 0;

  return inventory.reduce(
    (total, item) => total + (item.incoming_stock ?? 0),
    0,
  );
};
