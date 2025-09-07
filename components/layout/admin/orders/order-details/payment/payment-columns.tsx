import { ColumnDef } from "@tanstack/react-table"

export type Payment = {
    payment_terms: string
    payment_id: string
    gateway: string
    mop_id: string
    status: string
    amount: string
    received_on: string
}

export const paymentColumns: ColumnDef<Payment>[] = [
    {
        accessorKey: "payment_terms",
        header: () => <div className="text-left font-bold">Payment Terms</div>,
        cell: ({ row }) => <div>{row.original.payment_terms}</div>,
    },
    {
        accessorKey: "payment_id",
        header: () => <div className="text-left font-bold">Payment ID</div>,
        cell: ({ row }) => <div>#{row.original.payment_id}</div>,
    },
    {
        accessorKey: "gateway",
        header: () => <div className="text-left font-bold">Gateway</div>,
        cell: ({ row }) => <div>{row.original.gateway}</div>,
    },
    {
        accessorKey: "mop_id",
        header: () => <div className="text-left font-bold">MOP ID</div>,
        cell: ({ row }) => <div>{row.original.mop_id}</div>,
    },
    {
        accessorKey: "status",
        header: () => <div className="text-left font-bold">Status</div>,
        cell: ({ row }) => (
            <div className="capitalize">{row.original.status}</div>
        ),
    },
    {
        accessorKey: "amount",
        header: () => <div className="text-left font-bold">Amount</div>,
        cell: ({ row }) => <div>{row.original.amount}</div>,
    },
    {
        accessorKey: "received_on",
        header: () => <div className="text-left font-bold">Received on</div>,
        cell: ({ row }) => <div>{row.original.received_on}</div>,
    },
]
