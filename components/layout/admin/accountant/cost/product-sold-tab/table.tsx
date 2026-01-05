// components/provider-table.tsx
"use client";

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
import { providerColumns } from "./column";
import { ProviderItem } from "@/types/checkout";
import { useCallback, useMemo } from "react";

interface ProviderTableProps {
  data: ProviderItem[];
  setSelectedProviderId: (id_provider: string) => void;
  setOpen: (open: boolean) => void;
}

export function ProviderTable({
  data,
  setOpen,
  setSelectedProviderId,
}: ProviderTableProps) {
  const handleOpenDrawer = useCallback(
    (id: string) => {
      setSelectedProviderId(id);
      setOpen(true);
    },
    [setSelectedProviderId, setOpen],
  );

  const columns = useMemo(
    () => providerColumns({ onOpenDrawer: handleOpenDrawer, data: data }),
    [handleOpenDrawer],
  );

  const table = useReactTable({
    data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan} // 🔥 BẮT BUỘC
                  style={{ width: header.getSize() }}
                  className="bg-secondary/10"
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
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getAllLeafColumns().length}
                className="text-center py-6"
              >
                No data
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
