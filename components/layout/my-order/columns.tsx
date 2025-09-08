import { CartItem } from "@/types/cart";
import { ProductItem } from "@/types/products";
import { ColumnDef } from "@tanstack/react-table";

export const myOrderTableColumns: ColumnDef<CartItem>[] = [
    {
        accessorKey: 'product_name',
        cell: ({ row }) => {
            return (
                <div>{row.original.products.name}</div>
            )
        }
    },
    {
        accessorKey: 'quantity',
        cell: ({ row }) => {
            return (
                <div>{row.original.quantity}</div>
            )
        }
    },
    {
        accessorKey: 'product_price',
        cell: ({ row }) => {
            return (
                <div>€{row.original.item_price * row.original.quantity}</div>
            )
        }
    }
]