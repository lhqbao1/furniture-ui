"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  OnChangeFn,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomPagination } from "@/components/shared/custom-pagination";
import React, { useEffect, useState } from "react";
import { CheckOut } from "@/types/checkout";
import { CartItem } from "@/types/cart";
import { getDeliveryOrderColumns } from "@/components/layout/cart/columns";
import { ProductItem } from "@/types/products";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  totalItems: number;
  hasBackground?: boolean;
  totalPages: number;
  addButtonText?: string;
  addButtonUrl?: string;
  isAddButtonModal?: boolean;
  addButtonModalContent?: React.ReactNode;
  hasPagination?: boolean;
  hasExpanded?: boolean;
  is_delivery_multiple?: boolean;
  hasCount?: boolean;
  hasHeaderBackGround?: boolean;
  renderRowSubComponent?: (row: any) => React.ReactNode;
  isSticky?: boolean;
  stickyContainerClassName?: string;
  onSelectionChange?: (ids: string[]) => void; // 👈 thêm
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
}

export function ProductTable<TData, TValue>({
  columns,
  data,
  page,
  pageSize,
  setPage,
  setPageSize,
  totalItems,
  hasBackground,
  totalPages,
  addButtonText,
  addButtonUrl,
  isAddButtonModal = false,
  addButtonModalContent,
  hasPagination = true,
  hasExpanded = false,
  is_delivery_multiple = false,
  hasCount = true,
  hasHeaderBackGround = false,
  isSticky = false,
  stickyContainerClassName,
  onSelectionChange,
  columnVisibility,
  onColumnVisibilityChange,
  renderRowSubComponent,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "id_provider", desc: false }, // default sort by id_provider asc
  ]);
  const [expandedRowId, setExpandedRowId] = React.useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns: columns,
    pageCount: Math.ceil(totalItems / pageSize),
    state: {
      pagination: { pageIndex: page - 1, pageSize },
      sorting,
      rowSelection, // ✅ state lưu selection ở đây
      ...(columnVisibility ? { columnVisibility } : {}),
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    manualSorting: true,
    onRowSelectionChange: setRowSelection, // ✅ cập nhật khi người dùng click
    onColumnVisibilityChange,
    meta: {
      expandedRowId,
      setExpandedRowId,
    },
  });

  const selectedProductIds = React.useMemo(
    () =>
      table
        .getSelectedRowModel()
        .rows.map((row) => (row.original as ProductItem).id),
    [rowSelection], // 👈 chỉ đổi khi selection đổi
  );

  useEffect(() => {
    onSelectionChange?.(selectedProductIds);
  }, [selectedProductIds]);

  const transformCartItems = (cartItems: CartItem[]): CartItem[] => {
    return cartItems.flatMap((item) => {
      const product = item.products;

      if (product.bundles && product.bundles.length > 0) {
        // Tách ra các dòng con
        return product.bundles.map((bundle) => ({
          ...item,
          products: bundle.bundle_item, // thay thế bằng sản phẩm con
          quantity: bundle.quantity * item.quantity, // dùng số lượng của bundle
        }));
      }

      // Không có bundles thì giữ nguyên
      return item;
    });
  };

  return (
    <div className={cn("flex flex-col gap-4", isSticky && "h-full min-h-0")}>
      <div
        className={cn("rounded-md border w-full", isSticky && "flex-1 min-h-0")}
      >
        <Table
          className={`${isSticky ? "relative" : "overflow-auto"}`}
          containerClassName={
            isSticky
              ? cn(
                  "overflow-y-auto h-full",
                  stickyContainerClassName ?? "max-h-[70vh]",
                )
              : stickyContainerClassName
          }
        >
          <TableHeader className={isSticky ? "sticky top-0 z-20" : ""}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{
                      width: (header.column.columnDef.meta as any)?.width,
                      minWidth: (header.column.columnDef.meta as any)?.width,
                      maxWidth: (header.column.columnDef.meta as any)?.width,
                    }}
                    className={`${
                      hasHeaderBackGround ? "bg-secondary/10" : "bg-background"
                    } ${isSticky ? "sticky top-0 z-30 shadow-sm bg-green-100" : ""}`}
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
            {!hasExpanded
              ? table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className={
                      hasBackground && index % 2 === 1 ? "bg-secondary/5" : ""
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{
                          width: (cell.column.columnDef.meta as any)?.width,
                          minWidth: (cell.column.columnDef.meta as any)?.width,
                          maxWidth: (cell.column.columnDef.meta as any)?.width,
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, {
                          ...cell.getContext(),
                          expandedRowId,
                          setExpandedRowId,
                          currentRowId: row.id,
                        })}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : table.getRowModel().rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <TableRow>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, {
                            ...cell.getContext(),
                            expandedRowId,
                            setExpandedRowId,
                            currentRowId: row.id,
                          })}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Hàng expand */}
                    {expandedRowId === row.id && (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="bg-muted/10"
                        >
                          <div
                            className={`
                                                    overflow-hidden transition-all duration-1000 ease-in-out 
                                                    ${
                                                      expandedRowId === row.id
                                                        ? "max-h-[400px] opacity-100"
                                                        : "max-h-0 opacity-0"
                                                    }
                                                    `}
                          >
                            <div className="p-4 text-sm">
                              {/* USE renderRowSubComponent IF provided */}
                              {typeof renderRowSubComponent === "function" ? (
                                renderRowSubComponent(row)
                              ) : (
                                // fallback: the original nested ProductTable you had
                                <ProductTable<CartItem, unknown>
                                  data={transformCartItems(
                                    (row.original as CheckOut).cart.items,
                                  )}
                                  columns={getDeliveryOrderColumns({
                                    is_multiple_delivery: (
                                      row.original as CheckOut
                                    ).supplier
                                      ? (row.original as CheckOut).supplier
                                          .delivery_multiple
                                      : false,
                                  })}
                                  page={1}
                                  pageSize={5}
                                  setPage={() => {}}
                                  setPageSize={() => {}}
                                  hasPagination={false}
                                  totalItems={
                                    (row.original as CheckOut).cart.items.length
                                  }
                                  totalPages={1}
                                  hasCount={false}
                                />
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
          </TableBody>
        </Table>
      </div>

      {hasPagination ? (
        <CustomPagination
          page={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
          totalItems={totalItems}
        />
      ) : (
        ""
      )}
    </div>
  );
}
