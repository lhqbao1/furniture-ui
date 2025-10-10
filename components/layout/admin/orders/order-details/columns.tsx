import { CartItem } from "@/types/cart";
import { ColumnDef } from "@tanstack/react-table";

export const orderDetailColumn: ColumnDef<CartItem>[] = [
    {
        accessorKey: "quantity",
        header: () => (
            <div className="text-center w-full">Quantity</div>
        ),
        cell: ({ row }) => {
            return (
                <div className="text-center">{row.original.quantity}</div>
            )
        }
    },
    {
        accessorKey: "id",
        header: () => (
            <div className="text-center w-full">ID</div>
        ),
        cell: ({ row }) => {
            return (
                <div className="text-center">#{row.original.products.id_provider}</div>
            )
        }
    },
    {
        accessorKey: "ean",
        header: () => (
            <div className="text-center w-full">EAN Number</div>
        ),
        cell: ({ row }) => {
            return (
                <div className="text-center">{row.original.products.ean}</div>
            )
        }
    },
    {
        accessorKey: "product_name",
        header: "Name",
        cell: ({ row }) => {
            return (
                <div>{row.original.products.name}</div>
            )
        }
    },

    // {
    //     accessorKey: "net_price",
    //     header: () => (
    //         <div className="text-right w-full">Net price</div>
    //     ),
    //     cell: ({ row }) => {
    //         const netPrice = row.original.price_whithout_tax / row.original.quantity
    //         return (
    //             <div className="text-right">€{netPrice.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
    //         )
    //     }
    // },

    {
        accessorKey: "tax",
        header: () => (
            <div className="text-center w-full">Tax</div>
        ),
        cell: ({ row }) => {
            return (
                <div className="text-right">€{(row.original.final_price - row.original.price_whithout_tax).toFixed(2)}</div>
            )
        }
    },
    {
        accessorKey: "invoice_amount",
        header: () => (
            <div className="text-right w-full">Unit Price</div>
        ),
        cell: ({ row }) => {
            return (
                <div className="text-right">€{row.original.item_price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            )
        }
    },
    // {
    //     accessorKey: "discount",
    //     header: () => <div className="text-right w-full">Discount</div>,
    //     cell: ({ row }) => {
    //         const { final_price, cost, discount_percent } = row.original.products;
    //         const discount = final_price
    //             ? ((final_price - cost) / final_price) * 100
    //             : 0;
    //         return <div className="text-right">{discount_percent?.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</div>;
    //     },
    // },
    // {
    //     accessorKey: "surcharge_total",
    //     header: () => (
    //         <div className="text-right w-full">Surcharge</div>
    //     ),
    //     cell: ({ row }) => {
    //         return (
    //             <div className="text-right">€{row.original.final_price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
    //         )
    //     }
    // },
    // {
    //     accessorKey: "total_amount_net",
    //     header: () => (
    //         <div className="text-right w-full">Total amount(net)</div>
    //     ),
    //     cell: ({ row }) => {
    //         return (
    //             <div className="text-right">€{row.original.price_whithout_tax.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
    //         )
    //     }
    // },
    {
        accessorKey: "total_invoice_amount",
        header: () => (
            <div className="text-right w-full">Total amount</div>
        ),
        cell: ({ row }) => {
            return (
                <div className="text-right">€{row.original.final_price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            )
        }
    },
    {
        accessorKey: "ware_house",
        header: () => (
            <div className="text-center w-full">Ware House</div>
        ),
        cell: ({ row }) => {
            return (
                <div className="text-center">AMM</div>
            )
        }
    },

    // {
    //     accessorKey: "property_id",
    //     header: () => (
    //         <div className="text-center w-full">Property ID</div>
    //     ),
    //     cell: ({ row }) => {
    //         return (
    //             <div className="text-center"></div>
    //         )
    //     }
    // },
    // {
    //     accessorKey: "outgoing",
    //     header: () => (
    //         <div className="text-center w-full">Outgoing Items</div>
    //     ),
    //     cell: ({ row }) => {
    //         return (
    //             <div className="text-center"></div>
    //         )
    //     }
    // },
]