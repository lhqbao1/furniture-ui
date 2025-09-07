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
      <div>
        <div>{row.original.product_name}</div>
        {row.original.variant_name && (
          <div className="text-xs text-muted-foreground">{row.original.variant_name}</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "id",
    header: "Item ID",
    cell: ({ row }) => `#${row.original.id.slice(0, 7)}`
  },
  {
    accessorKey: "price",
    header: "Unit price",
    cell: ({ row }) => `€${row.original.final_price.toFixed(2)}`,
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
      const { price_whithout_tax, final_price } = row.original

      if (!price_whithout_tax || price_whithout_tax === 0) return "0%"

      const vat = ((final_price - price_whithout_tax) / price_whithout_tax) * 100

      return `${vat.toFixed(2)}%`
    },
  },

  {
    id: "amount",
    header: "Amount",
    cell: ({ row }) => {
      return `€${row.original.final_price.toFixed(2)}`
    },
  },
]
