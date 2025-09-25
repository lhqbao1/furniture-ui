import { ColumnDef } from "@tanstack/react-table"
import ViewFileDialog from "../../order-list/view-file"

// Kiểu dữ liệu cho mỗi row
export type DocumentRow = {
    document: string
    code: string
    dateSent: string
    viewType?: string
    checkOutId?: string
}

export const documentColumns: ColumnDef<DocumentRow>[] = [
    {
        accessorKey: "document",
        header: () => <div className="text-left font-bold">Documents</div>,
        cell: ({ row }) => <div>{row.original.document}</div>,
    },
    {
        accessorKey: "code",
        header: () => <div className="text-left font-bold">Doc. Code</div>,
        cell: ({ row }) => <div>{row.original.code}</div>,
    },
    {
        accessorKey: "dateSent",
        header: () => <div className="text-left font-bold">Date sent</div>,
        cell: ({ row }) => <div>{row.original.dateSent}</div>,
    },
    {
        id: "view",
        header: () => <div className="text-center font-bold">View</div>,
        cell: ({ row }) => {
            const type = row.original.viewType
            return (
                <ViewFileDialog checkoutId={row.original.checkOutId ?? ''} type={type} />
            )
        }
    },
]