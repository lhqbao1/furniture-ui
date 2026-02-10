import { ColumnDef } from "@tanstack/react-table";
import ViewFileDialog from "../../order-list/view-file";
import DownloadInvoice from "./download-invoice";

// Kiểu dữ liệu cho mỗi row
export type DocumentRow = {
  document: string;
  code: string;
  dateSent: string;
  viewType?: string;
  checkOutId?: string;
};

export const documentColumns: ColumnDef<DocumentRow>[] = [
  {
    accessorKey: "document",
    header: () => <div className="text-left uppercase ">Documents</div>,
    cell: ({ row }) => <div>{row.original.document}</div>,
  },
  {
    accessorKey: "code",
    header: () => <div className="text-left uppercase ">Doc. Code</div>,
    cell: ({ row }) => <div>{row.original.code}</div>,
  },
  {
    accessorKey: "dateSent",
    header: () => <div className="text-left uppercase ">Date sent</div>,
    cell: ({ row }) => <div>{row.original.dateSent}</div>,
  },
  {
    id: "view",
    header: () => <div className="text-center uppercase">View</div>,
    cell: ({ row }) => {
      return (
        <DownloadInvoice
          checkoutId={row.original.checkOutId ?? ""}
          type={row.original.viewType ?? ""}
        />
      );
    },
  },
];
