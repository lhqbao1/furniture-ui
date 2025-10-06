import { CartItem } from "@/types/cart"
import { ColumnDef } from "@tanstack/react-table"


export const invoiceColumns: ColumnDef<CartItem>[] = [
  {
    id: "pos",
    header: "Pos.",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "name",
    header: "Item(s)",
    cell: ({ row }) => (
      <div className="max-w-[300px] text-wrap">
        <div>{row.original.products.name}</div>
        <div>#{row.original.products.id_provider}</div>
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Unit price</div>,
    cell: ({ row }) => <div className="text-right">€{row.original.final_price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>,
  },
  {
    accessorKey: "qty",
    header: "Quantity",
    cell: ({ row }) => `${row.original.quantity}`,
  },
  {
    accessorKey: "vat",
    header: "VAT",
    cell: ({ row }) => {
      return <div>{row.original.products.tax}</div>
    },
  },

  {
    id: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      return <div className="text-right">€{row.original.final_price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
    },
  },
]
