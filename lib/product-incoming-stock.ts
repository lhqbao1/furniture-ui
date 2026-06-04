import { calculateAvailableStock } from "@/hooks/calculate_available_stock";
import { ProductItem } from "@/types/products";

export type IncomingDisplayItem = {
  id: string;
  quantity: number;
  date: Date;
};

const getInventoryPosFromAnyProduct = (
  productLike:
    | (Partial<ProductItem> & {
        inventory_po?: ProductItem["inventory_pos"] | null;
        inventories_po?: ProductItem["inventory_pos"] | null;
      })
    | null
    | undefined,
) =>
  productLike?.inventory_pos ??
  productLike?.inventories_po ??
  productLike?.inventory_po ??
  [];

export const getIncomingDisplayItems = (
  product: ProductItem,
): IncomingDisplayItem[] => {
  const now = new Date();

  const buildFutureIncomingRows = (
    inventoryPos: ProductItem["inventory_pos"] | undefined,
  ) =>
    (inventoryPos ?? [])
      .map((item) => {
        if ((item.quantity ?? 0) <= 0) return null;
        if (!item.list_delivery_date) return null;

        const date = new Date(item.list_delivery_date);
        if (Number.isNaN(date.getTime())) return null;

        date.setHours(23, 59, 59, 999);
        if (date < now) return null;

        return {
          id: item.id,
          quantity: item.quantity ?? 0,
          date,
        };
      })
      .filter((item): item is IncomingDisplayItem => item !== null)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

  const isBundleProduct = (product.bundles?.length ?? 0) > 0;
  if (isBundleProduct) {
    const bundleStates = (product.bundles ?? [])
      .map((bundle) => {
        const quantityPerBundle = Number(bundle?.quantity ?? 0);
        if (quantityPerBundle <= 0 || !bundle?.bundle_item) return null;

        const currentStockUnits = Math.max(
          0,
          calculateAvailableStock(bundle.bundle_item),
        );

        const incomingByDate = new Map<number, number>();
        for (const entry of buildFutureIncomingRows(
          getInventoryPosFromAnyProduct(bundle.bundle_item),
        )) {
          const timestamp = entry.date.getTime();
          incomingByDate.set(
            timestamp,
            (incomingByDate.get(timestamp) ?? 0) + (entry.quantity ?? 0),
          );
        }

        return { quantityPerBundle, incomingByDate, currentStockUnits };
      })
      .filter(
        (
          state,
        ): state is {
          quantityPerBundle: number;
          incomingByDate: Map<number, number>;
          currentStockUnits: number;
        } => state !== null,
      );

    if (bundleStates.length === 0) return [];

    const allDates = Array.from(
      new Set(
        bundleStates.flatMap((state) =>
          Array.from(state.incomingByDate.keys()),
        ),
      ),
    ).sort((a, b) => a - b);

    if (allDates.length === 0) return [];

    const cumulativeByBundle = bundleStates.map(
      (state) => state.currentStockUnits,
    );
    let previousParentTotal = Math.max(
      0,
      Math.min(
        ...bundleStates.map((state, index) =>
          Math.floor(cumulativeByBundle[index] / state.quantityPerBundle),
        ),
      ),
    );
    const bundleRows: IncomingDisplayItem[] = [];
    const parentKey = String(product.id ?? product.id_provider ?? "product");

    for (const timestamp of allDates) {
      bundleStates.forEach((state, index) => {
        cumulativeByBundle[index] += state.incomingByDate.get(timestamp) ?? 0;
      });

      const parentTotalAtDate = Math.max(
        0,
        Math.min(
          ...bundleStates.map((state, index) =>
            Math.floor(cumulativeByBundle[index] / state.quantityPerBundle),
          ),
        ),
      );

      const parentDelta = parentTotalAtDate - previousParentTotal;
      if (parentDelta > 0) {
        bundleRows.push({
          id: `bundle-${parentKey}-${timestamp}`,
          quantity: parentDelta,
          date: new Date(timestamp),
        });
      }

      previousParentTotal = parentTotalAtDate;
    }

    return bundleRows;
  }

  return buildFutureIncomingRows(getInventoryPosFromAnyProduct(product));
};
