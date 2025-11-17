"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
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
import { CustomPagination } from "@/components/shared/custom-pagination";
import React, { useState } from "react";
import { CheckOut } from "@/types/checkout";
import { CartItem } from "@/types/cart";
import { getDeliveryOrderColumns } from "@/components/layout/cart/columns";

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
  renderRowSubComponent,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "updated_at", desc: true }, // mặc định sort theo updated_at giảm dần
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
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    manualSorting: true,
    onRowSelectionChange: setRowSelection, // ✅ cập nhật khi người dùng click
    meta: {
      expandedRowId,
      setExpandedRowId,
    },
  });

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
    <div className="flex flex-col gap-4">
      {hasCount ? <p>{totalItems} items found</p> : ""}

      <div className="rounded-md border w-full overflow-x-scroll">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`${hasHeaderBackGround ? "bg-secondary/5" : ""}`}
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
                            {/* <div className="p-4 text-sm">
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
                            </div> */}
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
        />
      ) : (
        ""
      )}
    </div>
  );
}
