"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AffiliateResponse } from "@/types/affiliate";
import AddOrEditAffiliateDialog from "./add-or-edit-dialog";
import DeleteAffiliateDialog from "./delete-dialog";
// import GenerateAffiliateLinkDialog from "./generate-link-dialog";

const formatNumber = (value: number) =>
  value.toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

export const affiliateColumns: ColumnDef<AffiliateResponse>[] = [
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
    accessorKey: "name",
    header: "NAME",
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: "code",
    header: "CODE",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="font-mono"
      >
        {row.original.code}
      </Badge>
    ),
  },
  {
    accessorKey: "weight",
    header: "WEIGHT",
    cell: ({ row }) => <div>{formatNumber(row.original.weight)}</div>,
  },
  {
    accessorKey: "commission_rate",
    header: "COMMISSION RATE",
    cell: ({ row }) => <div>{formatNumber(row.original.commission_rate)}%</div>,
  },
  {
    id: "actions",
    header: "ACTIONS",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <AddOrEditAffiliateDialog
          isEdit
          affiliateValues={row.original}
        />
        {/* <GenerateAffiliateLinkDialog
          affiliateId={row.original.id}
          affiliateName={row.original.name}
        /> */}
        <DeleteAffiliateDialog
          affiliateId={row.original.id}
          affiliateName={row.original.name}
        />
      </div>
    ),
  },
];
