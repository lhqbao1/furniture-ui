import React, { useMemo } from "react";
import { documentColumns, DocumentRow } from "./document-columns";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckOutMain } from "@/types/checkout";
import { formatDateTimeString } from "@/lib/date-formated";

interface DocumentTableProps {
  order?: CheckOutMain;
  invoiceCode?: string;
}

const DocumentTable = ({ order, invoiceCode }: DocumentTableProps) => {
  const data = useMemo<DocumentRow[]>(() => {
    if (!order) return [];

    const baseData: DocumentRow[] = [
      {
        document: "Invoice",
        code: invoiceCode ?? "",
        dateSent: formatDateTimeString(
          order.created_at
            ? order.created_at.toString()
            : new Date().toString(),
        ),
        viewType: "invoice",
        checkOutId: order.id,
      },
    ];

    // ✅ Chỉ thêm Package Slip khi có <= 1 checkout
    if (order.checkouts?.length ?? 0) {
      baseData.push({
        document: "Package Slip",
        code: order.checkout_code ?? "",
        dateSent: formatDateTimeString(
          order.created_at
            ? order.created_at.toString()
            : new Date().toString(),
        ),
        viewType: "package",
        checkOutId: order.id,
      });
    }

    if (order.status.toLowerCase() === "return") {
      baseData.push({
        document: "Credit Node",
        code: order.checkout_code ?? "",
        dateSent: formatDateTimeString(
          order.created_at
            ? order.created_at.toString()
            : new Date().toString(),
        ),
        viewType: "credit-node",
        checkOutId: order.id,
      });
    }

    return baseData;
  }, [order, invoiceCode]);

  const columns = useMemo(
    () =>
      documentColumns({
        invoicePdfFile: order?.invoice_pdf_file ?? null,
        mainCheckoutId: order?.id,
      }),
    [order?.id, order?.invoice_pdf_file],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm w-full">
      <Table>
        <TableHeader className="bg-[#f3faf6]">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="text-[13px] font-semibold text-slate-700">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-slate-500"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DocumentTable;
