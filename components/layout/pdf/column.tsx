import { CartItem } from "@/types/cart"
import { ColumnDef } from "@tanstack/react-table"

export const parseTax = (tax: string | number): number => {
  if (typeof tax === "number") return tax
  const cleaned = tax.replace("%", "")
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}


export const invoiceColumns: ColumnDef<CartItem>[] = [
  {
    id: "pos",
    header: "Pos.",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "ean",
    header: "Art.-Nr",
    cell: ({ row }) => `${row.original.products.ean}`,
  },
  {
    accessorKey: "name",
    header: "Bezeichnung",
    cell: ({ row }) => (
      <div className="max-w-[300px] text-wrap">
        <div>{row.original.products.name}</div>
        <div>#{row.original.products.id_provider}</div>
      </div>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Menge",
    cell: ({ row }) => <div className="text-center">{row.original.quantity}</div>,

  },
  {
    accessorKey: "vat",
    header: "MwSt.",
    cell: ({ row }) => {
      return <div>{row.original.products.tax}</div>
    },
  },
  {
    accessorKey: "unit_price",
    header: () => <div className="text-right">E.-Peris</div>,
    cell: ({ row }) => <div className="text-right">{row.original.item_price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</div>,
  },
  {
    id: "amount",
    header: () => <div className="text-right">G.-Peris</div>,
    cell: ({ row }) => {
      return <div className="text-right">{row.original.final_price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</div>
    },
  },
  // {
  //   accessorKey: "net_price",
  //   header: "Summe",
  //   cell: ({ row }) => {
  //     return <div>{((row.original.products.final_price - (parseTax(row.original.products.tax) / 100 * row.original.products.final_price)) * row.original.quantity).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</div>
  //   },
  // },
]
