"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { CartItem } from "@/types/cart";

export function useMyOrderTableColumns(): ColumnDef<CartItem>[] {
  const t = useTranslations();

  return [
    {
      accessorKey: "product_name",
      header: () => <span>{t("product")}</span>,
      meta: { width: "400px" },
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="line-clamp-2 text-wrap font-medium text-foreground">
            {row.original.products.name}
          </div>
          <div className="text-xs text-muted-foreground">
            #{row.original.products.id_provider ?? "-"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: () => <span>{t("quantity")}</span>,
      meta: { width: "100px" },
      cell: ({ row }) => (
        <div className="text-center font-medium text-foreground">x{row.original.quantity}</div>
      ),
    },
    {
      accessorKey: "product_price",
      header: () => <span>{t("total")}</span>,
      meta: { width: "150px" },
      cell: ({ row }) => (
        <div className="text-right font-semibold text-foreground">
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
