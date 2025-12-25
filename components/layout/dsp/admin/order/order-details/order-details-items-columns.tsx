import { getShippingStatusStyle } from "@/components/layout/admin/orders/order-list/status-styles";
import {
  formatDate,
  formatDateString,
  formatDateTimeString,
} from "@/lib/date-formated";
import { CartItem } from "@/types/cart";
import { CheckOut } from "@/types/checkout";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

export function orderDetailItemColumnSupplier(
  order: CheckOut,
): ColumnDef<CartItem>[] {
  return [
    {
      accessorKey: "id",
      header: () => <div className="text-center w-full">Item No.</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.original.products.id_provider}</div>
      ),
    },

    {
      accessorKey: "ean",
      header: () => <div className="text-center w-full">Vendor Item No</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.original.products.ean}</div>
      ),
    },

    {
      accessorKey: "name",
      header: () => <div className="text-center w-full">Item Name</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.original.products.name}</div>
      ),
    },

    {
      accessorKey: "status",
      header: () => <div className="text-center w-full">STATUS</div>,
      cell: ({ row }) => {
        const raw = order.status?.toLowerCase() ?? "";
        const { text, bg, color } = getShippingStatusStyle(raw);

        return (
          <div
            className={`mx-auto px-4 py-1 rounded-full text-sm font-medium capitalize ${bg} ${color}`}
            style={{ width: "fit-content" }}
          >
            {text}
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: () => (
        <div className="text-center w-full">Planned Delivery Date</div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {order.shipment ? (
            formatDateString(order.shipment.shipper_date)
          ) : (
            <div className="text-center">—</div>
          )}
        </div>
      ),
    },

    {
      accessorKey: "invoice_amount",
      header: () => <div className="text-center w-full">UNIT PRICE</div>,
      cell: ({ row }) => (
        <div className="text-center">
          €
          {row.original.item_price.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },

    {
      accessorKey: "quantity",
      header: () => <div className="text-center w-full">QUANTITY</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.original.quantity}</div>
      ),
    },

    {
      accessorKey: "total_invoice_amount",
      header: () => <div className="text-center w-full">TOTAL AMOUNT</div>,
      cell: ({ row }) => (
        <div className="text-center">
          €
          {row.original.final_price.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },
  ];
}
