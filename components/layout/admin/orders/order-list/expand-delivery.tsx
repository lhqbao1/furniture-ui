"use client";

import React from "react";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import { CheckOut, CheckOutMain } from "@/types/checkout";
import { CartItem } from "@/types/cart";
import { orderChildColumns } from "./column";
import { orderListExpandColumns } from "./product-columns";
import { ProductItem } from "@/types/products";
import { format, getISOWeek } from "date-fns";
import { cn } from "@/lib/utils";

function transformCartItems(items: CartItem[]): CartItem[] {
  return items.flatMap((item) => {
    // // Nếu là bundle → tách thành nhiều dòng con
    // if (product.bundles && product.bundles.length > 0) {
    //   return product.bundles.map((bundle) => ({
    //     ...item,
    //     products: bundle.bundle_item,
    //     quantity: bundle.quantity * item.quantity,
    //   }));
    // }

    // Không phải bundle → giữ nguyên
    return item;
  });
}

type IncomingDisplayItem = {
  id: string;
  quantity: number;
  date: Date;
};

const getIncomingDisplayItems = (
  product?: Partial<ProductItem> | null,
): IncomingDisplayItem[] => {
  if (!product) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buildFutureIncomingRows = (
    inventoryPos: ProductItem["inventory_pos"] | undefined,
  ) =>
    (inventoryPos ?? [])
      .map((item) => {
        const quantity = Number(item?.quantity ?? 0);
        if (quantity <= 0) return null;
        if (!item?.list_delivery_date) return null;

        const date = new Date(item.list_delivery_date);
        if (Number.isNaN(date.getTime())) return null;
        date.setHours(0, 0, 0, 0);
        if (date <= today) return null;

        return {
          id: String(item.id ?? `${date.getTime()}-${quantity}`),
          quantity,
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

        const incomingByDate = new Map<number, number>();
        for (const entry of buildFutureIncomingRows(
          bundle.bundle_item.inventory_pos,
        )) {
          const timestamp = entry.date.getTime();
          incomingByDate.set(
            timestamp,
            (incomingByDate.get(timestamp) ?? 0) + (entry.quantity ?? 0),
          );
        }

        return { quantityPerBundle, incomingByDate };
      })
      .filter(
        (
          state,
        ): state is { quantityPerBundle: number; incomingByDate: Map<number, number> } =>
          state !== null,
      );

    if (bundleStates.length === 0) return [];

    const allDates = Array.from(
      new Set(bundleStates.flatMap((state) => Array.from(state.incomingByDate.keys()))),
    ).sort((a, b) => a - b);

    if (allDates.length === 0) return [];

    const cumulativeByBundle = bundleStates.map(() => 0);
    let previousParentTotal = 0;
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

  return buildFutureIncomingRows(product.inventory_pos);
};

export function flattenCheckOutCart(checkoutMain: CheckOutMain): CartItem[] {
  if (!checkoutMain?.checkouts) return [];

  return (
    checkoutMain.checkouts
      // ❌ lọc bỏ exchange và cancel_exchange
      .filter((checkout) => {
        const status = checkout.status?.toLowerCase();
        return status !== "exchange" && status !== "cancel_exchange";
      })
      // ✔ flatten items
      .flatMap((checkout) => transformCartItems(checkout.cart.items))
  );
}

const OrderExpandTable = ({ row }: { row: { original: CheckOutMain } }) => {
  const checkout = row.original as CheckOutMain;
  const supplierName = checkout.checkouts[0].supplier
    ? checkout.checkouts[0].supplier.business_name
    : "Prestige Home";
  const items = flattenCheckOutCart(checkout);
  const deliveryOrders: CheckOut[] = Array.isArray(checkout.checkouts)
    ? checkout.checkouts
    : [];

  const incomingByProduct = React.useMemo(
    () =>
      items
        .map((item, index) => {
          const product = item?.products;
          const incomingItems = getIncomingDisplayItems(product);

          return {
            key: String(
              item?.id ??
                `${String(product?.id ?? product?.id_provider ?? "product")}-${index}`,
            ),
            name:
              item?.purchased_products?.name?.trim() ||
              product?.name?.trim() ||
              `Product ${index + 1}`,
            incomingItems,
          };
        })
        .filter((entry) => entry.incomingItems.length > 0),
    [items],
  );
  const today = React.useMemo(() => {
    const current = new Date();
    current.setHours(0, 0, 0, 0);
    return current;
  }, []);
  const sixWeeksFromNow = React.useMemo(() => {
    const value = new Date(today);
    value.setDate(value.getDate() + 42);
    return value;
  }, [today]);

  return (
    <div className="p-4 bg-white rounded-md border">
      {incomingByProduct.length > 0 && (
        <div className="mb-4 rounded-md border border-secondary/20 bg-secondary/5 p-3">
          <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
            Incoming stock schedule
          </div>

          <div className="space-y-2">
            {incomingByProduct.map((entry) => (
              <div key={entry.key} className="text-sm">
                <div className="font-medium line-clamp-1">{entry.name}</div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {entry.incomingItems.map((incoming) => {
                    const formattedDate = `CW ${String(
                      getISOWeek(incoming.date),
                    ).padStart(2, "0")} - ${format(incoming.date, "MMMM d")}`;
                    const isSoon =
                      incoming.date > today && incoming.date <= sixWeeksFromNow;

                    return (
                      <span
                        key={incoming.id}
                        className={cn(
                          "inline-flex items-center rounded-md border bg-background px-2 py-1 text-xs",
                          isSoon &&
                            "border-secondary/30 bg-secondary/10 text-secondary",
                        )}
                      >
                        {incoming.quantity} | {formattedDate}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ProductTable<CartItem, unknown>
        data={items}
        columns={orderListExpandColumns(
          supplierName,
          checkout.checkouts[0].shipping_address.country ?? "DE",
          checkout.checkouts[0]?.user?.tax_id ?? "",
        )}
        page={1}
        pageSize={20}
        setPage={() => {}}
        setPageSize={() => {}}
        hasPagination={false}
        totalItems={items.length}
        totalPages={1}
        hasCount={false}
        hasHeaderBackGround
      />

      <div className="mt-4">
        <ProductTable<CheckOut, unknown>
          data={deliveryOrders}
          columns={orderChildColumns}
          page={1}
          pageSize={100}
          setPage={() => {}}
          setPageSize={() => {}}
          hasPagination={false}
          totalItems={deliveryOrders.length}
          totalPages={1}
          hasCount={false}
          hasHeaderBackGround
          headerClassName="!bg-yellow-100"
        />
      </div>
    </div>
  );
};

export default OrderExpandTable;
