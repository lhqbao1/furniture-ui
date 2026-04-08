import { getShippingStatusStyle } from "@/components/layout/admin/orders/order-list/status-styles";
import { formatDateString } from "@/lib/date-formated";
import { CartItem } from "@/types/cart";
import { CheckOut } from "@/types/checkout";
import { ColumnDef } from "@tanstack/react-table";

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
      accessorKey: "sku",
      header: () => <div className="text-center w-full">Vendor Item No</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.original.products.sku}</div>
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
      header: () => <div className="text-center w-full">Status</div>,
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
      accessorKey: "quantity",
      header: () => <div className="text-center w-full">Quantity</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.original.quantity}</div>
      ),
    },

    {
      accessorKey: "invoice_amount",
      header: () => <div className="text-center w-full">Unit Price</div>,
      cell: ({ row }) => (
        <div className="text-center">
          €
          {(row.original.products.cost ?? 0).toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },

    {
      accessorKey: "total_invoice_amount",
      header: () => <div className="text-center w-full">Shipping Costs</div>,
      cell: ({ row }) => (
        <div className="text-center">
          €
          {(row.original.products.delivery_cost ?? 0).toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },
  ];
}
