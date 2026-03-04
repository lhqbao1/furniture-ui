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
import {
  getStatusStyle,
  getStatusStyleDe,
} from "../admin/orders/order-list/status-styles";

interface MyOrderDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  orderData: CheckOut;
  pos?: number;
}

type DeliveryRange = {
  start: number;
  end: number;
};

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
    <div className="overflow-hidden rounded-md border">
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow>
            <TableHead
              colSpan={columns.length}
              className="bg-secondary/15 px-2"
            >
              <div className="flex justify-between w-full">
                <div className="text-md font-semibold">Lieferung: {pos}</div>
                <p>{getStatusStyleDe(orderData.status).text ?? ""}</p>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows?.length ? (
            <>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        cell.column.getSize()
                          ? `!w-[${cell.column.getSize()}px]`
                          : ""
                      }
                    >
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
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
