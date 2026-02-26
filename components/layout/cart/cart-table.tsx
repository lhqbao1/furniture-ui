"use client";

import React, { useState, useCallback, useMemo } from "react";
import { debounce } from "lodash";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CartItem, CartResponse } from "@/types/cart";
import {
  useDeleteCartItem,
  useUpdateCartItemQuantity,
  useUpdateCartItemStatus,
} from "@/features/cart/hook";
import CartTableSkeleton from "./table-skeleton";
import { toast } from "sonner";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { GetCartColumns } from "./columns";
import { useTranslations } from "next-intl";
import { useIsPhone } from "@/hooks/use-is-phone";

interface CartTableProps {
  cart?: CartResponse;
  isLoadingCart?: boolean;
  isCheckout?: boolean;
  localQuantities: Record<string, number>;
  setLocalQuantities: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
}

const CartTable = ({
  cart,
  isLoadingCart,
  isCheckout = false,
  localQuantities,
  setLocalQuantities,
}: CartTableProps) => {
  const [localStatuses, setLocalStatuses] = useState<Record<string, boolean>>(
    {},
  );
  const t = useTranslations();
  const updateCartItemQuantityMutation = useUpdateCartItemQuantity();
  const deleteCartItemMutation = useDeleteCartItem();
  const updateCartItemStatusMutation = useUpdateCartItemStatus();
  const isPhone = useIsPhone();
  // const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({})
  const [rowSelection, setRowSelection] = useState({});

  // ✅ debounce API update
  const debouncedUpdate = useCallback(
    debounce((itemId: string, quantity: number) => {
      updateCartItemQuantityMutation.mutate(
        { cartItemId: itemId, quantity },
        {
          onSuccess: () => console.log("✅ Cập nhật thành công"),
          onError: () => console.log("❌ Cập nhật thất bại"),
        },
      );
    }, 400),
    [],
  );

  const handleToggleSelect = (item: CartItem, is_active: boolean) => {
    // update local state
    setLocalStatuses((prev) => ({
      ...prev,
      [item.id]: is_active,
    }));

    // call api update cart item status for checkout
    updateCartItemStatusMutation.mutate(
      { cartItemId: item.id, is_active },
      {
        onSuccess: () => console.log("✅ Toggle thành công"),
        onError: () => console.log("❌ Toggle thất bại"),
      },
    );
  };

  const handleUpdateCartItemQuantity = (
    item: CartItem,
    newQuantity: number,
  ) => {
    if (newQuantity <= 0) {
      deleteCartItemMutation.mutate(item.id, {
        onSuccess: () => console.log("✅ Xóa thành công"),
        onError: () => console.log("❌ Xóa thất bại"),
      });
      return;
    }

    const totalIncomingStock =
      item.products.inventory_pos?.reduce((sum, inv) => {
        if (!inv.list_delivery_date) return sum;
        const date = new Date(inv.list_delivery_date);
        if (Number.isNaN(date.getTime())) return sum;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        if (date < today) return sum;
        return sum + (inv.quantity ?? 0);
      }, 0) ?? 0;

    if (newQuantity > item.products.stock + totalIncomingStock) {
      toast.error(t("notEnoughStock"));
      return;
    }

    setLocalQuantities((prev) => ({ ...prev, [item.id]: newQuantity }));
    debouncedUpdate(item.id, newQuantity);
  };

  const handleDeleteItem = (item: CartItem) => {
    deleteCartItemMutation.mutate(item.id, {
      onSuccess: () => console.log("✅ Xóa thành công"),
      onError: () => console.log("❌ Xóa thất bại"),
    });
  };

  const columns = GetCartColumns({
    localQuantities,
    onUpdateQuantity: handleUpdateCartItemQuantity,
    onDeleteItem: handleDeleteItem,
    onToggleSelect: handleToggleSelect,
    isCheckout,
    localStatuses,
  });

  const flattenedItems = useMemo(
    () => cart?.flatMap((cartItem) => cartItem.items),
    [cart],
  );

  const table = useReactTable({
    data: flattenedItems ?? [],
    columns,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="col-span-12 md:col-span-8 flex-1">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold mb-6">{t("shoppingCart")}</h2>
        <p className="text-xl font-bold mb-6">
          ({cart ? cart.reduce((acc, group) => acc + group.items.length, 0) : 0}{" "}
          {t("items")})
        </p>
      </div>

      <Table className="overflow-x-hidden">
        {isPhone ? (
          ""
        ) : (
          <TableHeader className="border-t">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
        )}

        {isLoadingCart ? (
          <TableBody>
            <CartTableSkeleton />
          </TableBody>
        ) : (
          <TableBody>
            {table.getRowModel().rows.length
              ? table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : ""}
          </TableBody>
        )}
      </Table>
    </div>
  );
};

export default CartTable;
