import React, { useCallback, useMemo, useState } from "react";
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
import B2BInvoiceDrawer from "../../order-list/b2b-invoice-drawer";
import { filterMainCheckoutForInvoice } from "@/lib/checkout-filter";
import { toast } from "sonner";

interface DocumentTableProps {
  order?: CheckOutMain;
  invoiceCode?: string;
}

const isTruthyB2BValue = (value: unknown) =>
  value === true || String(value).trim().toLowerCase() === "true";

const DocumentTable = ({ order, invoiceCode }: DocumentTableProps) => {
  const [openB2BDrawer, setOpenB2BDrawer] = useState(false);
  const [b2bMarketplace, setB2BMarketplace] = useState("");
  const isB2BOrder = isTruthyB2BValue(order?.is_b2b);
  const filteredB2BOrder = useMemo(
    () => filterMainCheckoutForInvoice(order),
    [order],
  );
  const selectedB2BOrders = useMemo(
    () => (filteredB2BOrder ? [filteredB2BOrder] : []),
    [filteredB2BOrder],
  );

  const handleOpenB2BInvoiceDrawer = useCallback(() => {
    if (!order) {
      toast.error("Cannot create B2B invoice", {
        description: "Order data is missing.",
      });
      return;
    }

    if (!isB2BOrder) {
      toast.error("Cannot create B2B invoice", {
        description: "This order is not marked as B2B.",
      });
      return;
    }

    setB2BMarketplace(order.from_marketplace?.trim() ?? "");
    setOpenB2BDrawer(true);
  }, [isB2BOrder, order]);

  const data = useMemo<DocumentRow[]>(() => {
    if (!order) return [];
    const normalizedStatus = String(order.status ?? "").toLowerCase();

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
        document: "Pack Slip",
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

    if (normalizedStatus === "return") {
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

    if (normalizedStatus === "return_issue") {
      baseData.push({
        document: "Refund invoice",
        code: order.checkout_code ? `RK${order.checkout_code}` : "",
        dateSent: formatDateTimeString(
          order.created_at
            ? order.created_at.toString()
            : new Date().toString(),
        ),
        viewType: "refund-invoice",
        checkOutId: order.id,
      });
    }

    return baseData;
  }, [order, invoiceCode]);

  const columns = useMemo(
    () =>
      documentColumns({
        order,
        invoicePdfFile: order?.invoice_pdf_file ?? null,
        invoicePdfFile2: order?.invoice_pdf_file_2 ?? null,
        mainCheckoutId: order?.id,
        onCreateB2BInvoice: handleOpenB2BInvoiceDrawer,
      }),
    [handleOpenB2BInvoiceDrawer, order],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm w-full">
        <Table>
          <TableHeader className="bg-[#f3faf6]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-[13px] font-semibold text-slate-700"
                    >
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

      <B2BInvoiceDrawer
        open={openB2BDrawer}
        onOpenChange={setOpenB2BDrawer}
        marketplace={b2bMarketplace}
        selectedOrders={selectedB2BOrders}
      />
    </>
  );
};

export default DocumentTable;
