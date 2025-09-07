import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { FileText } from "lucide-react"

// Kiểu dữ liệu cho mỗi row
export type DocumentRow = {
    document: string
    code: string
    dateSent: string
    viewUrl?: string
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
        cell: ({ row }) => (
            <div className="flex justify-center">
                <Button variant="ghost" size="icon" asChild>
                    <a href={row.original.viewUrl ?? "#"} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4" />
                    </a>
                </Button>
            </div>
        ),
    },
]