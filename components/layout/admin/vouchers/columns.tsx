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
import { VOUCHER_TYPE } from "@/data/data";

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
    cell: ({ row }) => (
      <div>
        {VOUCHER_TYPE.find((v) => v.value === row.original.type)?.label}
      </div>
    ),
  },
  {
    accessorKey: "discount_type",
    header: ({}) => <div className="text-center">VOUCHER DISCOUNT TYPE</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original.discount_type}</div>
    ),
  },
  {
    accessorKey: "discount_value",
    header: () => <div className="text-center">DISCOUNT VALUE</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.discount_type === "fixed" && "€"}
        {row.original.discount_type === "fixed"
          ? row.original.discount_value.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : row.original.discount_value}
        {row.original.discount_type === "percent" && "%"}
      </div>
    ),
  },
  {
    accessorKey: "max_discount",
    header: () => <div className="text-center">MAX DISCOUNT</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.max_discount === 0 ? "None" : row.original.max_discount}
      </div>
    ),
  },
  {
    accessorKey: "min_order_value",
    header: "MIN ORDER VALUE",
    cell: ({ row }) => (
      <div>
        {row.original.min_order_value === 0 ? (
          "None"
        ) : (
          <>
            €
            {row.original.min_order_value.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </>
        )}
      </div>
    ),
  },
  {
    accessorKey: "total_usage_limit",
    header: ({}) => <div className="text-center">QUANTITY</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original.total_usage_limit}</div>
    ),
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
          {row.original.type === "product" && (
            <AssignVoucherToProducts
              voucher_id={row.original.id}
              voucher_code={row.original.code}
            />
          )}

          {row.original.type === "user_specific" && (
            <AssignVoucherToUsers
              voucher_id={row.original.id}
              voucher_code={row.original.code}
            />
          )}
        </div>
      );
    },
  },
];
