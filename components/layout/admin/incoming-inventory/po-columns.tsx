import { PurchaseOrderDetail } from "@/types/po";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import Link from "next/link";

function ActionsCell({ po }: { po: PurchaseOrderDetail }) {
  return (
    <div className="flex gap-3 justify-center items-center">
      <Link href={`/admin/logistic/inventory/incoming/${po.id}`}>
        <Pencil className="text-primary cursor-pointer size-4" />
      </Link>
      {/* <DeletePODialog poId={po.id} /> */}
    </div>
  );
}

export const POColumns: ColumnDef<PurchaseOrderDetail>[] = [
  {
    accessorKey: "po_number",
    header: "PO Number",
    cell: ({ row }) => {
      return <div>{row.original.po_number}</div>;
    },
  },
  {
    accessorKey: "pi_number",
    header: "PI Number",
    cell: ({ row }) => {
      return <div>{row.original.pi_number}</div>;
    },
  },

  {
    accessorKey: "buyer",
    header: () => <div className="text-center">BUYER</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.original.buyer.name}</div>;
    },
  },

  {
    accessorKey: "seller",
    meta: { width: 300 },
    header: () => <div className="text-center">SELLER</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center text-wrap">{row.original.seller.name}</div>
      );
    },
  },

  {
    accessorKey: "loading_port",
    header: () => <div className="text-center">Loading Port</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.original.loading_port}</div>;
    },
  },

  {
    accessorKey: "shipping_method",
    header: () => <div className="text-center">Shipping method</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center uppercase">
          {row.original.shipping_method}
        </div>
      );
    },
  },

  {
    accessorKey: "destination",
    header: () => <div className="text-center">Destination</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.original.destination}</div>;
    },
  },

  {
    accessorKey: "number_of_containers",
    header: ({}) => <div className="text-center">Containers</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.original.number_of_containers ?? "-"}
        </div>
      );
    },
  },

  {
    id: "actions",
    header: ({}) => <div className="text-center">ACTION</div>,
    cell: ({ row }) => <ActionsCell po={row.original} />,
  },
];
