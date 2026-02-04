"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ProductItem } from "@/types/products";
import { useLocale } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import AddOrEditInventoryDialog from "./dialog/add-inventory-dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useEditProduct } from "@/features/products/hook";
import { useUpdateStockProduct } from "@/features/products/inventory/hook";
import { useAtom } from "jotai";
import { adminIdAtom } from "@/store/auth";

// function ActionsCell({ product }: { product: ProductItem }) {
//   const locale = useLocale();
//   const router = useRouter();
//   const queryClient = useQueryClient();

//   return (
//     <div className="flex gap-2 justify-center items-center">
//       {/* <Link href={`/admin/products/${product.id}/edit`}> */}
//       <AddOrEditInventoryDialog
//         productId={product.id}
//         inventoryData={product.inventory}
//         cost={product.cost}
//         stock={product.stock}
//       />

//       {/* {product.inventory && product.inventory.length > 0 ? <ProductInventoryDeleteDialog id={}/> : ""} */}
//     </div>
//   );
// }

function EditableStockCell({ product }: { product: ProductItem }) {
  const [value, setValue] = useState<number | string>(product.stock);
  const [editing, setEditing] = useState(false);
  const [adminId, setAdminId] = useAtom(adminIdAtom);
  const EditProductMutation = useUpdateStockProduct();
  let quantity = 0;

  const handleEditProductStock = () => {
    if (Number(value) < product.stock) {
      quantity = -(product.stock - Number(value));
    } else {
      quantity = Math.abs(Number(value) - product.stock);
    }

    EditProductMutation.mutate(
      {
        payload: {
          product_id: product.id,
          quantity: quantity,
          user_id: adminId ?? "",
        },
      },
      {
        onSuccess(data, variables, context) {
          toast.success("Update product stock successful");
          setEditing(false);
        },
        onError(error, variables, context) {
          toast.error("Update product stock fail");
        },
      },
    );
  };

  return (
    <div className="">
      {editing ? (
        <Input
          type="number"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            setValue(v === "" ? "" : Number(v));
          }}
          onBlur={() => {
            if (value !== product.stock) {
            } else {
              setEditing(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleEditProductStock();
            }
            if (e.key === "Escape") {
              setValue(product.stock);
              setEditing(false);
            }
          }}
          autoFocus
          disabled={EditProductMutation.isPending}
          className={cn(
            "w-20",
            EditProductMutation.isPending ? "cursor-wait" : "cursor-text",
          )}
        />
      ) : (
        <div
          className="cursor-pointer text-center"
          onClick={() => setEditing(true)}
        >
          {product.stock}
        </div>
      )}
    </div>
  );
}

function EditableEANCell({ product }: { product: ProductItem }) {
  const [value, setValue] = useState(product.ean ?? "");
  const [editing, setEditing] = useState(false);
  const EditProductMutation = useEditProduct();

  useEffect(() => {
    setValue(product.ean ?? "");
  }, [product.ean]);

  const handleEditProductEAN = () => {
    if (value && value.replace(/\D/g, "").length > 13) {
      toast.error("EAN must be at most 13 digits");
      return;
    }

    EditProductMutation.mutate(
      {
        input: {
          ...product,
          ean: value.replace(/\D/g, ""),
          category_ids: product.categories.map((c) => c.id),
          ...(product.brand?.id ? { brand_id: product.brand.id } : {}),
          // 🔹 Thêm bundles
          ...(product.bundles?.length
            ? {
                bundles: product.bundles.map((item) => ({
                  product_id: item.bundle_item.id,
                  quantity: item.quantity,
                })),
              }
            : { bundles: [] }),
          brand_id: product.brand ? product.brand.id : null,
        },
        id: product.id,
      },
      {
        onSuccess(data, variables, context) {
          toast.success("Update product ean successful");
          setEditing(false);
        },
        onError(error, variables, context) {
          toast.error("Update product ean fail");
        },
      },
    );
  };

  return (
    <div className="text-center">
      {editing ? (
        <Input
          value={value}
          placeholder="Enter EAN"
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            if (value !== (product.ean ?? "")) {
              handleEditProductEAN();
            } else {
              setEditing(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleEditProductEAN();
            }
            if (e.key === "Escape") {
              setValue(product.ean ?? "");
              setEditing(false);
            }
          }}
          autoFocus
          disabled={EditProductMutation.isPending}
          className={cn(
            EditProductMutation.isPending ? "cursor-wait" : "cursor-text",
          )}
        />
      ) : (
        <div
          className="cursor-pointer min-h-[24px]"
          onClick={() => setEditing(true)}
        >
          {product.ean ? (
            product.ean
          ) : (
            <span className="text-muted-foreground italic">
              Click to add EAN
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export const getInventoryColumns = (
  setSortByStock: (val?: "asc" | "desc") => void,
  is_incoming?: boolean,
): ColumnDef<ProductItem>[] => [
  {
    accessorKey: "static_files",
    header: "IMAGE",
    cell: ({ row }) => {
      const image = row.original.static_files?.[0]?.url;

      return (
        <HoverCard openDelay={100} closeDelay={100}>
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
    accessorKey: "id",
    header: ({}) => <div className="text-center uppercase">ID</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.original.id_provider}</div>;
    },
  },

  {
    accessorKey: "ean",
    meta: { width: 150 },
    header: ({}) => <div className="text-center uppercase">EAN</div>,
    cell: ({ row }) => {
      return <EditableEANCell product={row.original} />;
    },
  },

  {
    accessorKey: "name",
    meta: { width: 250 },
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
    cell: ({ row }) => (
      <div className="text-wrap">
        <div>{row.original.name}</div>
        <div className="flex flex-col gap-2 items-start">
          <div>SKU: {row.original.sku}</div>
        </div>
      </div>
    ),
    enableSorting: true,
  },

  {
    accessorKey: "supplier",
    meta: { width: 200 },
    header: ({}) => <div className="text-center uppercase">SUPPLIER</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center text-wrap">
          {row.original.owner
            ? row.original.owner.business_name
            : "Prestige Home"}
        </div>
      );
    },
  },

  {
    accessorKey: "purchase_cost",
    header: ({}) => <div className="text-center uppercase">Purchase cost</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.original.cost > 0 ? (
            <>
              {" "}
              €
              {row.original.cost.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </>
          ) : (
            <div className="text-center">—</div>
          )}
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
          {row.original.final_price ? (
            <div>
              €
              {row.original.final_price.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              /pcs
            </div>
          ) : (
            <div className="text-center">—</div>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "available",
    header: ({}) => <div className="text-center uppercase">Available</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.original.stock - (row.original.result_stock ?? 0)}
        </div>
      );
    },
  },

  {
    accessorKey: "reserved",
    header: ({}) => <div className="text-center uppercase">Reserved</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.original.result_stock} </div>;
    },
  },

  {
    accessorKey: "physical",
    header: ({}) => <div className="text-center uppercase">Physical Stock</div>,
    cell: ({ row }) => {
      return <EditableStockCell product={row.original} />;
    },
  },

  {
    accessorKey: "available_purchase_value",
    header: ({}) => (
      <div className="text-center uppercase">Available Purchase Value</div>
    ),
    cell: ({ row }) => {
      const available = row.original.stock - (row.original.result_stock ?? 0);
      return (
        <div className="text-center">
          {row.original.cost ? (
            <div>
              €
              {(row.original.cost * available).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          ) : (
            <div className="text-center">—</div>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "reserved_purchase_value",
    header: ({}) => (
      <div className="text-center uppercase">Reserved Purchase Value</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.original.result_stock ? (
            <div>
              €
              {(row.original.cost * row.original.result_stock).toLocaleString(
                "de-DE",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              )}
            </div>
          ) : (
            <div className="text-center">—</div>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "physical_purchase_value",
    header: ({}) => (
      <div className="text-center uppercase">Physical Purchase Value</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.original.stock && row.original.cost > 0 ? (
            <div>
              €
              {(row.original.cost * row.original.stock).toLocaleString(
                "de-DE",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              )}
            </div>
          ) : (
            <div className="text-center">—</div>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "available_sale_value",
    header: ({}) => (
      <div className="text-center uppercase">Available Sale Value</div>
    ),
    cell: ({ row }) => {
      const available = row.original.stock - (row.original.result_stock ?? 0);

      return (
        <div className="text-center">
          {available && row.original.final_price > 0 ? (
            <div>
              €
              {(row.original.final_price * available).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          ) : (
            <div className="text-center">—</div>
          )}
        </div>
      );
    },
  },

  // {
  //   accessorKey: "incomming",
  //   header: () => (
  //     <div className="text-center uppercase">
  //       Incoming stock / date /unit landed cost
  //     </div>
  //   ),
  //   cell: ({ row }) => {
  //     const inventoryData = row.original.inventory;

  //     if (!inventoryData || inventoryData.length === 0) {
  //       return <div className="text-center">Updating</div>;
  //     }

  //     return (
  //       <div className="flex flex-col gap-2 items-center">
  //         {inventoryData.map((item) => (
  //           <div
  //             key={item.id}
  //             className="w-full flex flex-row-reverse items-center justify-end gap-1"
  //           >
  //             {/* INFO */}
  //             <div className="grid grid-cols-3 gap-2 text-sm w-[280px]">
  //               <div className="">{item.incoming_stock} pcs</div>
  //               <div className="">{formatIOSDate(item.date_received)}</div>
  //               <div className="">
  //                 €
  //                 {(item.cost_received / item.incoming_stock).toLocaleString(
  //                   "de-DE",
  //                   {
  //                     minimumFractionDigits: 2,
  //                     maximumFractionDigits: 2,
  //                   },
  //                 )}
  //               </div>
  //             </div>

  //             {/* ACTIONS */}
  //             <div className="flex gap-2">
  //               <EditInventoryDialog
  //                 cost={row.original.cost}
  //                 productId={row.original.id}
  //                 stock={row.original.stock}
  //                 inventoryData={item}
  //               />

  //               <ProductInventoryDeleteDialog id={item.id} />
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     );
  //   },
  // },

  // {
  //   accessorKey: "cost",
  //   header: ({}) => <div className="text-center uppercase">Landed cost</div>,
  //   cell: ({ row }) => {
  //     const inv = row.original.inventory || [];

  //     const total = inv.reduce((sum, item) => {
  //       const cost = Number(item.cost_received ?? 0);

  //       const value = cost;
  //       return sum + (isNaN(value) ? 0 : value);
  //     }, 0);

  //     return (
  //       <div className="text-center">
  //         {total > 0 ? (
  //           <>
  //             {" "}
  //             €
  //             {total.toLocaleString("de-DE", {
  //               minimumFractionDigits: 2,
  //               maximumFractionDigits: 2,
  //             })}
  //           </>
  //         ) : (
  //           "Updating"
  //         )}
  //       </div>
  //     );
  //   },
  // },

  // {
  //   id: "actions",
  //   header: "ACTION",
  //   cell: ({ row }) => <ActionsCell product={row.original} />,
  // },
];
