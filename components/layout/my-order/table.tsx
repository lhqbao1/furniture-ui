"use client";

import {
  ColumnDef,
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
import { CheckOut } from "@/types/checkout";
import { getStatusStyleDe } from "../admin/orders/order-list/status-styles";

interface MyOrderDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  orderData: CheckOut;
  pos?: number;
}

export function MyOrderDataTable<TData, TValue>({
  columns,
  data,
  orderData,
  pos,
}: MyOrderDataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-xl border border-secondary/15">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead
              colSpan={columns.length}
              className="bg-secondary/10 px-3 py-3"
            >
              <div className="flex justify-between w-full">
                <div className="text-sm font-semibold uppercase tracking-wide text-foreground">
                  Lieferung {pos}
                </div>
                <p className="text-xs font-semibold text-secondary">
                  {getStatusStyleDe(orderData.status).text ?? ""}
                </p>
              </div>
            </TableHead>
          </TableRow>
          <TableRow className="border-b border-secondary/10 bg-muted/30 hover:bg-muted/30">
            {table.getFlatHeaders().map((header) => (
              <TableHead
                key={header.id}
                className="h-10 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows?.length ? (
            <>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b border-secondary/10 transition-colors hover:bg-secondary/5"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-3 align-top">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Keine Produkte in dieser Lieferung.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
