import { ColumnDef } from "@tanstack/react-table";
import DownloadInvoice from "./download-invoice";

// Kiểu dữ liệu cho mỗi row
export type DocumentRow = {
  document: string;
  code: string;
  dateSent: string;
  viewType?: string;
  checkOutId?: string;
};

interface DocumentColumnsProps {
  invoicePdfFile?: string | null;
  invoicePdfFile2?: string | null;
  mainCheckoutId?: string;
}

export const documentColumns = ({
  invoicePdfFile,
  invoicePdfFile2,
  mainCheckoutId,
}: DocumentColumnsProps): ColumnDef<DocumentRow>[] => [
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
          invoicePdfFile={invoicePdfFile}
          invoicePdfFile2={invoicePdfFile2}
          mainCheckoutId={mainCheckoutId ?? row.original.checkOutId}
        />
      );
    },
  },
];
