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
import { formatDateTime } from "@/lib/date-formated";
import { useTranslations } from "next-intl";
import { useCallback } from "react";

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
  const t = useTranslations();

  const parseRange = useCallback(
    (str: string | null | undefined): DeliveryRange => {
      if (!str) {
        throw new Error(`delivery_time is null or empty: "${str}"`);
      }

      const [startStr, endStr] = str.split("-");
      const start = Number(startStr);
      const end = Number(endStr);

      if (isNaN(start) || isNaN(end)) {
        throw new Error(`Invalid delivery_time format: "${str}"`);
      }

      return { start, end };
    },
    [],
  );

  const compareRanges = useCallback(
    (a: DeliveryRange, b: DeliveryRange): number => {
      if (a.start !== b.start) return a.start - b.start;
      return a.end - b.end;
    },
    [],
  );

  const getMaxDeliveryTime = useCallback(
    (data: CheckOut): string | null => {
      const ranges = data.cart.items
        .map((item) => parseRange(item.products.delivery_time))
        .sort(compareRanges);

      if (ranges.length === 0) return null;

      const max = ranges[ranges.length - 1];
      return `${max.start}-${max.end}`;
    },
    [parseRange, compareRanges],
  );

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
                <p>{orderData.status}</p>
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
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
