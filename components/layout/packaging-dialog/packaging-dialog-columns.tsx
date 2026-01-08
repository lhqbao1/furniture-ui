import { CartItem } from "@/types/cart";
import { ColumnDef } from "@tanstack/react-table";

export const packagingColumns: ColumnDef<CartItem>[] = [
  {
    id: "pos",
    header: () => (
      <div className="text-center text-black text-base  font-semibold">
        Lfd. Nr.
      </div>
    ),
    cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
  },
  {
    id: "id",
    header: () => (
      <div className="text-center text-black text-base  font-semibold">
        Artikel ID
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.products.sku}</div>
    ),
  },
  {
    accessorKey: "name",
    header: () => (
      <div className="text-black text-base  font-semibold">
        Artikelbezeichnung
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-wrap text-left">
        <div>{row.original.products.name}</div>
        <div>{row.original.products.ean}</div>
      </div>
    ),
  },
  {
    accessorKey: "qty",
    header: () => (
      <div className="text-center text-black text-base  font-semibold">
        Menge
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.quantity}</div>
    ),
  },
];
