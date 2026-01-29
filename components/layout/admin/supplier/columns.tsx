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
import DeleteDialog from "./delete-dialog";
import AddOrEditSupplierForm from "./add-or-edit-form";

const EditSupplierCell = ({ supplier }: { supplier: SupplierResponse }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
        >
          <Pencil className="w-4 h-4 text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-1/3">
        <DialogHeader>
          <DialogTitle>Edit Supplier</DialogTitle>
        </DialogHeader>
        <AddOrEditSupplierForm
          supplierValues={supplier}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export const supplierColumns: ColumnDef<SupplierResponse>[] = [
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
    accessorKey: "business_name",
    header: "NAME",
    cell: ({ row }) => <div>{row.original.business_name}</div>,
  },
  {
    accessorKey: "vat_id",
    header: "VAT",
    cell: ({ row }) => <div>{row.original.vat_id}</div>,
  },
  {
    accessorKey: "email",
    header: "EMAIl",
    cell: ({ row }) => <div>{row.original.email}</div>,
  },
  {
    accessorKey: "email_order",
    header: "ORDER EMAIL",
    cell: ({ row }) => <div>{row.original.email_order}</div>,
  },
  {
    accessorKey: "email_billing",
    header: "BILLING EMAIL",
    cell: ({ row }) => <div>{row.original.email_billing}</div>,
  },
  {
    accessorKey: "phone_number",
    header: "PHONE NUMBER",
    cell: ({ row }) => <div>{row.original.phone_number}</div>,
  },
  {
    id: "actions",
    header: "ACTION",
    cell: ({ row }) => {
      return (
        <div className="flex gap-1">
          <EditSupplierCell supplier={row.original} />
          {/* <DeleteDialog supplier_id={row.original.id} /> */}
        </div>
      );
    },
  },
];
