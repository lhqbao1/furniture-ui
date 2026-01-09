// invoice-columns.tsx
import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CartItem } from "@/types/cart";
import { calculateProductVAT } from "@/lib/caculate-vat";

export type InvoiceColumnsProps = {
  locale?: string; // ví dụ "de-DE"
  currency?: string; // ví dụ "€"
  // callback khi click vào mã sản phẩm (Art.-Nr)
  onProductClick?: (productId: string) => void;
  // tùy chỉnh formatter nếu cần
  numberFormatOptions?: Intl.NumberFormatOptions;
  // nếu muốn hiển thị EAN hay không
  showEan?: boolean;
  // parseTax function override (optional)
  tax?: string | number;
  country_code?: string | null;
  tax_id?: string | null;
};

export const parseTax = (tax: string | number): number => {
  if (typeof tax === "number") return tax;
  const cleaned = tax.replace("%", "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const createInvoiceColumns = ({
  locale = "de-DE",
  currency = "€",
  onProductClick,
  numberFormatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  showEan = true,
  tax,
  country_code,
  tax_id,
}: InvoiceColumnsProps = {}): ColumnDef<CartItem>[] => {
  const moneyFormatter = (value: number) =>
    `${Number(value).toLocaleString(locale, numberFormatOptions)}${currency}`;

  return [
    {
      id: "pos",
      header: "Pos.",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "ean",
      header: "Art.-Nr",
      cell: ({ row }) => {
        const idProvider = row.original.products.id_provider;
        return onProductClick ? (
          <button
            type="button"
            onClick={() => onProductClick(row.original.products.id)}
            className="underline font-semibold text-left"
          >
            {idProvider}
          </button>
        ) : (
          <span className="underline font-semibold">{idProvider}</span>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Bezeichnung",
      cell: ({ row }) => (
        <div className="max-w-[300px] text-wrap">
          <div>{row.original.products.name}</div>
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Menge",
      cell: ({ row }) => (
        <div className="text-center">{row.original.quantity}</div>
      ),
    },
    {
      accessorKey: "vat",
      header: "MwSt.",
      cell: ({ row }) => {
        const { vatRate } = calculateProductVAT(
          row.original.final_price,
          row.original.products.tax,
          country_code,
          tax_id,
        );
        return <div>{(vatRate * 100).toFixed(2)}%</div>;
      },
    },
    {
      accessorKey: "unit_price",
      header: () => <div className="text-right">E.-Peris</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {moneyFormatter(row.original.item_price)}
        </div>
      ),
    },
    {
      id: "amount",
      header: () => <div className="text-right">G.-Peris</div>,
      cell: ({ row }) => {
        const amount = row.original.final_price; // final_price assumed per row (already multiplied by qty)
        return <div className="text-right">{moneyFormatter(amount)}</div>;
      },
    },
  ];
};
