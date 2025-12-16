"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ProductItem } from "@/types/products";
import { useLocale } from "next-intl";
import { Link, useRouter } from "@/src/i18n/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { getProductById } from "@/features/products/api";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { formatDate } from "@/lib/date-formated";
import { formatIOSDate } from "@/lib/ios-to-num";
import AddOrEditInventoryDialog from "./dialog/add-inventory-dialog";
import ProductInventoryDeleteDialog from "./dialog/delete-dialog";
import { Pencil, Trash } from "lucide-react";
import EditInventoryDialog from "./dialog/edit-inventory-dialog";

function ActionsCell({ product }: { product: ProductItem }) {
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <div className="flex gap-2 justify-center items-center">
      {/* <Link href={`/admin/products/${product.id}/edit`}> */}
      <AddOrEditInventoryDialog
        productId={product.id}
        inventoryData={product.inventory}
        cost={product.cost}
        stock={product.stock}
      />

      {/* {product.inventory && product.inventory.length > 0 ? <ProductInventoryDeleteDialog id={}/> : ""} */}
    </div>
  );
}

export const getInventoryColumns = (
  setSortByStock: (val?: "asc" | "desc") => void,
): ColumnDef<ProductItem>[] => [
  {
    accessorKey: "static_files",
    header: "IMAGE",
    cell: ({ row }) => {
      const image = row.original.static_files?.[0]?.url;

      return (
        <HoverCard
          openDelay={100}
          closeDelay={100}
        >
          <HoverCardTrigger asChild>
            <div className="w-12 h-12 relative cursor-pointer">
              {image ? (
                <Image
                  src={image}
                  fill
                  alt="icon"
                  className="object-contain rounded-md"
                  sizes="60px"
                  unoptimized
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-md" />
              )}
            </div>
          </HoverCardTrigger>

          {image && (
            <HoverCardContent className="p-2 w-[220px] h-[220px] flex items-center justify-center">
              <Image
                src={image}
                alt="preview"
                width={200}
                height={200}
                className="object-contain rounded-md"
                unoptimized
              />
            </HoverCardContent>
          )}
        </HoverCard>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant={"ghost"}
        className="font-semibold flex items-center px-0 justify-center gap-1 w-fit"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <div>NAME</div>
        <div className="mb-0.5">
          {{
            asc: "↑",
            desc: "↓",
          }[column.getIsSorted() as string] ?? "↕"}
        </div>
      </Button>
    ),
    // cell: ({ row }) => <EditableNameCell product={row.original} />,
    cell: ({ row }) => (
      <div className="max-w-80 w-80 text-wrap">
        <div>{row.original.name}</div>
        <div>SKU: {row.original.sku}</div>
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "available",
    header: ({}) => <div className="text-center uppercase">Available</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.original.stock} pcs.</div>;
    },
  },

  {
    accessorKey: "reserved",
    header: ({}) => <div className="text-center uppercase">Reserved</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">{row.original.result_stock} pcs.</div>
      );
    },
  },

  {
    accessorKey: "incomming",
    header: () => (
      <div className="text-center uppercase">Incoming stock / date / cost</div>
    ),
    cell: ({ row }) => {
      const inventoryData = row.original.inventory;

      if (!inventoryData || inventoryData.length === 0) {
        return <div className="text-center">Updating</div>;
      }

      return (
        <div className="flex flex-col gap-2 items-center">
          {inventoryData.map((item) => (
            <div
              key={item.id}
              className="w-full flex flex-row-reverse items-center justify-end gap-1"
            >
              {/* INFO */}
              <div className="flex justify-center items-center divide-x divide-gray-300 text-sm">
                <span className="px-2">{item.incoming_stock} pcs</span>
                <span className="px-2">
                  {formatIOSDate(item.date_received)}
                </span>
                <span className="px-2">
                  €
                  {(row.original.cost * item.incoming_stock).toLocaleString(
                    "de-DE",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    },
                  )}
                </span>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2">
                <EditInventoryDialog
                  cost={row.original.cost}
                  productId={row.original.id}
                  stock={row.original.stock}
                  inventoryData={item}
                />

                <ProductInventoryDeleteDialog id={item.id} />
              </div>
            </div>
          ))}
        </div>
      );
    },
  },

  {
    accessorKey: "cost",
    header: ({}) => <div className="text-center uppercase">Unit cost</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          €
          {row.original.cost
            ? row.original.cost.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : "Updating"}
          /pcs
        </div>
      );
    },
  },

  {
    accessorKey: "total_cost",
    header: ({}) => <div className="text-center uppercase">Total cost</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          €
          {(row.original.cost * row.original.stock).toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      );
    },
  },

  {
    accessorKey: "price",
    header: ({}) => <div className="text-center uppercase">Sale price</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          €
          {row.original.final_price
            ? row.original.final_price.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : "Updating"}
          /pcs
        </div>
      );
    },
  },

  {
    accessorKey: "supplier",
    header: ({}) => <div className="text-center uppercase">Supplier</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.original.owner
            ? row.original.owner.business_name
            : "Prestige Home"}
        </div>
      );
    },
  },

  {
    id: "actions",
    header: "ACTION",
    cell: ({ row }) => <ActionsCell product={row.original} />,
  },
];
