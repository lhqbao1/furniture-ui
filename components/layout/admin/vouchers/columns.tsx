"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { SupplierResponse } from "@/types/supplier";
import { VoucherItem } from "@/types/voucher";
import { formatDateTime, formatDateTimeString } from "@/lib/date-formated";
import VoucherStatusCell from "./columns/edit-voucher-status";
import AddVoucherDialog from "./add-or-edit-dialog";
import DeleteDialog from "./columns/delete-dialog";
import AssignVoucherToProducts from "./columns/assign-voucher-product";
import AssignVoucherToUsers from "./columns/assign-voucher-user";

export const voucherColumns: ColumnDef<VoucherItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "code",
    header: "CODE",
    cell: ({ row }) => <div>{row.original.code}</div>,
  },
  {
    accessorKey: "name",
    header: "NAME",
    cell: ({ row }) => <div>{row.original.name}</div>,
  },
  {
    accessorKey: "type",
    header: "VOUCHER TYPE",
    cell: ({ row }) => <div>{row.original.type}</div>,
  },
  {
    accessorKey: "discount_type",
    header: "VOUCHER DISCOUNT TYPE",
    cell: ({ row }) => <div>{row.original.discount_type}</div>,
  },
  {
    accessorKey: "discount_value",
    header: "DISCOUNT VALUE",
    cell: ({ row }) => <div>{row.original.discount_value}</div>,
  },
  {
    accessorKey: "max_discount",
    header: "MAX DISCOUNT",
    cell: ({ row }) => (
      <div>
        {row.original.max_discount === 0 ? "None" : row.original.max_discount}
      </div>
    ),
  },
  {
    accessorKey: "min_order_value",
    header: "MIN ORDER VALUE",
    cell: ({ row }) => (
      <div>
        {row.original.min_order_value === 0
          ? "None"
          : row.original.min_order_value}
      </div>
    ),
  },
  {
    accessorKey: "total_usage_limit",
    header: "QUANTITY",
    cell: ({ row }) => <div>{row.original.total_usage_limit}</div>,
  },
  {
    accessorKey: "status",
    header: "STATUS",
    cell: ({ row }) => (
      <div>
        <VoucherStatusCell voucher={row.original} />
      </div>
    ),
  },
  {
    accessorKey: "start_at",
    header: "PUBLISH DATE",
    cell: ({ row }) => <div>{formatDateTimeString(row.original.start_at)}</div>,
  },
  {
    accessorKey: "end_at",
    header: "EXPIRED DATE",
    cell: ({ row }) => <div>{formatDateTimeString(row.original.end_at)}</div>,
  },
  {
    id: "actions",
    header: "ACTION",
    cell: ({ row }) => {
      return (
        <div className="flex gap-1">
          <AddVoucherDialog
            isEdit
            voucherValues={row.original}
          />
          {/* <EditSupplierCell supplier={row.original} /> */}
          <DeleteDialog voucher_id={row.original.id} />
        </div>
      );
    },
  },
  {
    id: "assign",
    header: "ASSIGN",
    cell: ({ row }) => {
      return (
        <div className="flex gap-1">
          <AssignVoucherToProducts
            voucher_id={row.original.id}
            voucher_code={row.original.code}
          />

          <AssignVoucherToUsers
            voucher_id={row.original.id}
            voucher_code={row.original.code}
          />
        </div>
      );
    },
  },
];
