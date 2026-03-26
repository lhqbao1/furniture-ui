import { calculateProductVAT } from "@/lib/caculate-vat";
import { CartItem } from "@/types/cart";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

interface OrderDetailColumnsProps {
  country_code?: string | null;
  tax_id?: string | null;
}

export function getOrderDetailColumns({
  country_code,
  tax_id,
}: OrderDetailColumnsProps): ColumnDef<CartItem>[] {
  return [
    {
      id: "pos",
      header: () => <div className="text-center w-full">POS.</div>,
      cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
    },

    {
      id: "id",
      header: () => <div className="text-center w-full">ID</div>,
      cell: ({ row }) => (
        <div className="text-center">#{row.original.products.id_provider}</div>
      ),
    },
    {
      id: "ean",
      header: () => <div className="text-center w-full">EAN</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.original.products.ean}</div>
      ),
    },
    {
      id: "product_name",
      header: "NAME",
      cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          {row.original.products.name}
        </div>
      ),
    },

    {
      id: "vat",
      header: () => <div className="text-center w-full">VAT</div>,
      cell: ({ row }) => {
        const { vat } = calculateProductVAT(
          row.original.purchased_products
            ? row.original?.purchased_products?.final_price
            : row.original.products.final_price,
          row.original.products.tax,
          country_code,
          tax_id,
        );

        return (
          <div className="text-right">
            €
            {vat.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        );
      },
    },

    {
      id: "cost",
      header: () => <div className="text-right w-full">COST</div>,
      cell: ({ row }) => (
        <div className="text-right">
          €
          {(row.original.purchased_products
            ? row.original.purchased_products.final_price
            : row.original.products.cost
          ).toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },

    {
      id: "unit_price",
      header: () => <div className="text-right w-full">UNIT PRICE</div>,
      cell: ({ row }) => (
        <div className="text-right">
          €
          {(row.original.purchased_products
            ? row.original.purchased_products.final_price
            : row.original.products.final_price
          ).toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },

    {
      id: "quantity",
      header: () => <div className="text-center w-full">QUANTITY</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.original.quantity}</div>
      ),
    },
    {
      id: "total_amount",
      header: () => <div className="text-right w-full">TOTAL AMOUNT</div>,
      cell: ({ row }) => (
        <div className="text-right">
          €
          {(
            row.original.quantity *
            (row.original.purchased_products
              ? row.original.purchased_products.final_price
              : row.original.products.final_price)
          ).toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },
  ];
}
