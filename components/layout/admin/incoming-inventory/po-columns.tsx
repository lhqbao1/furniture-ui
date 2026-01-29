import { useRouter } from "@/src/i18n/navigation";
import { PurchaseOrderDetail } from "@/types/po";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { BookA, Container, Pencil } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import DeletePODialog from "./dialog/delete-po-dialog";

function ActionsCell({ po }: { po: PurchaseOrderDetail }) {
  return (
    <div className="flex gap-3 justify-center items-center">
      {/* <Link href={`/admin/products/${product.id}/edit`}> */}
      <Link href={`/admin/logistic/inventory/incoming/${po.id}/container`}>
        <Container className="text-primary cursor-pointer size-5" />
      </Link>
      <Link href={`/admin/logistic/inventory/incoming/${po.id}`}>
        <BookA className="text-primary cursor-pointer size-5" />
      </Link>
      <DeletePODialog poId={po.id} />
      {/* {product.inventory && product.inventory.length > 0 ? <ProductInventoryDeleteDialog id={}/> : ""} */}
    </div>
  );
}

export const POColumns: ColumnDef<PurchaseOrderDetail>[] = [
  //   {
  //     id: "select",
  //     header: ({ table }) => (
  //       <Checkbox
  //         checked={
  //           table.getIsAllPageRowsSelected() ||
  //           (table.getIsSomePageRowsSelected() && "indeterminate")
  //         }
  //         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //         aria-label="Select all"
  //       />
  //     ),
  //     cell: ({ row }) => (
  //       <Checkbox
  //         checked={row.getIsSelected()}
  //         onCheckedChange={(value) => row.toggleSelected(!!value)}
  //         aria-label="Select row"
  //       />
  //     ),
  //     enableSorting: false,
  //     enableHiding: false,
  //   },
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
    accessorKey: "customer_po_order",
    header: "Customer PO Order",
    cell: ({ row }) => {
      return <div>{row.original.customer_po_order ?? "-"}</div>;
    },
  },

  {
    accessorKey: "loading_port",
    header: "Loading Port",
    cell: ({ row }) => {
      return <div>{row.original.loading_port}</div>;
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
    accessorKey: "note",
    header: "Note",
    meta: { width: 300 },
    cell: ({ row }) => {
      return <div className="text-wrap">{row.original.note ?? "-"}</div>;
    },
  },

  {
    id: "actions",
    header: ({}) => <div className="text-center">ACTION</div>,
    cell: ({ row }) => <ActionsCell po={row.original} />,
  },
];
