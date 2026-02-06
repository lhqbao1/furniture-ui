"use client";
import { PurchaseOrderDetail } from "@/types/po";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, X } from "lucide-react";
import Link from "next/link";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useGetContainersByPurchaseOrder } from "@/features/incoming-inventory/container/hook";
import { useContainerInventory } from "@/features/incoming-inventory/inventory/hook";
import { Separator } from "@/components/ui/separator";
import { formatEUR } from "@/lib/format-euro";
import Image from "next/image";
import { formatDateDDMMYYYY } from "@/lib/date-formated";

function ContainerInventoryList({ containerId }: { containerId: string }) {
  const { data, isLoading } = useContainerInventory(containerId);

  if (isLoading) {
    return (
      <div className="text-xs text-muted-foreground mt-2">Loading items...</div>
    );
  }

  if (!data || data.length === 0) {
    return <div className="text-xs text-muted-foreground mt-2">No items.</div>;
  }

  return (
    <div className="my-2 space-y-3 text-xs text-muted-foreground">
      {data.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <Image src={item.product.image} width={80} height={80} alt="" />
          <div className="flex flex-col gap-2">
            <span className="truncate text-foreground">
              {item.product?.name || "-"}
            </span>
            <span className="">ID: {item.product.id_provider ?? ""}</span>
            <span className="">Qty: {item.quantity ?? 0} pcs</span>
            <span className="">
              Unit Cost: {formatEUR(item.unit_cost) ?? 0}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ContainersDrawerCell({ po }: { po: PurchaseOrderDetail }) {
  const { data, isLoading } = useGetContainersByPurchaseOrder(po.id);

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <button
          type="button"
          className="w-full text-center underline-offset-2 hover:underline cursor-pointer"
        >
          {po.number_of_containers ?? "-"}
        </button>
      </DrawerTrigger>
      <DrawerContent className="p-6 w-[600px] max-w-none data-[vaul-drawer-direction=right]:sm:max-w-[600px] mx-auto pointer-events-auto overflow-y-auto">
        <DrawerHeader className="p-0 mb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle>Containers · {po.po_number || "PO"}</DrawerTitle>
            <DrawerClose className="p-2">
              <X className="h-4 w-4" />
            </DrawerClose>
          </div>
        </DrawerHeader>

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : !data || data.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No containers found.
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((container, idx) => (
              <div key={container.id} className="rounded-md border p-3 text-sm">
                <div className="font-semibold">
                  Container {idx + 1}: {container.container_number || "-"}
                </div>
                <div>Size: {container.size || "-"}</div>{" "}
                <div>
                  Delivery:{" "}
                  {formatDateDDMMYYYY(container.date_to_warehouse) || "-"}
                </div>
                <Separator className="my-3" />
                <ContainerInventoryList containerId={container.id} />
              </div>
            ))}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}

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
      return <ContainersDrawerCell po={row.original} />;
    },
  },

  {
    id: "actions",
    header: ({}) => <div className="text-center">ACTION</div>,
    cell: ({ row }) => <ActionsCell po={row.original} />,
  },
];
