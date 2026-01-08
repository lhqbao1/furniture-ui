"use client";

import React from "react";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import { CheckOut, CheckOutMain } from "@/types/checkout";
import { CartItem } from "@/types/cart";
import { orderListExpandColumns } from "./product-columns";

function transformCartItems(items: CartItem[]): CartItem[] {
  return items.flatMap((item) => {
    const product = item.products;

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

const OrderExpandTable = ({ row }: { row: any }) => {
  const checkout = row.original as CheckOutMain;

  const items = flattenCheckOutCart(checkout);

  return (
    <div className="p-4 bg-white rounded-md border">
      <ProductTable<CartItem, unknown>
        data={items}
        columns={orderListExpandColumns}
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
    </div>
  );
};

export default OrderExpandTable;
