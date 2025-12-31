"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { CartItem } from "@/types/cart";

export function useMyOrderTableColumns(): ColumnDef<CartItem>[] {
  const t = useTranslations();

  return [
    {
      accessorKey: "product_name",
      header: t("product"),
      meta: { width: "400px" },
      cell: ({ row }) => (
        <div className="line-clamp-2 text-wrap">
          {row.original.products.name}
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: t("quantity"),
      meta: { width: "100px" },
      cell: ({ row }) => (
        <div className="text-center">x{row.original.quantity}</div>
      ),
    },
    {
      accessorKey: "product_price",
      header: t("total"),
      meta: { width: "150px" },
      cell: ({ row }) => (
        <div className="text-right">
          €
          {(row.original.item_price * row.original.quantity).toLocaleString(
            "de-DE",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            },
          )}
        </div>
      ),
    },
  ];
}
