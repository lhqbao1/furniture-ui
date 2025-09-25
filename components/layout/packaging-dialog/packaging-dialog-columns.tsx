import { CartItem } from "@/types/cart"
import { ColumnDef } from "@tanstack/react-table"

export const packagingColumns: ColumnDef<CartItem>[] = [
    {
        id: "pos",
        header: () => <div className="text-center text-white text-base uppercase font-semibold">Lfd. Nr.</div>,
        cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
    },
    {
        accessorKey: "name",
        header: () => <div className="text-white text-base uppercase font-semibold">Produktname</div>,
        cell: ({ row }) => (
            <div className="text-wrap">
                <div>{row.original.products.name}</div>
            </div>
        ),
    },
    {
        accessorKey: "qty",
        header: () => <div className="text-center text-white text-base uppercase font-semibold">Menge</div>,
        cell: ({ row }) => <div className="text-center">{row.original.quantity}</div>,
    },
]
