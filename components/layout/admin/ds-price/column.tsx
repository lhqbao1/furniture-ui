import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { useEditProduct } from "@/features/products/hook";
import { getCarrierLogo } from "@/lib/getCarrierImage";
import { cn } from "@/lib/utils";
import { ProductItem } from "@/types/products";
import { Checkbox } from "@radix-ui/react-checkbox";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

function EditDSPriceCell({ product }: { product: ProductItem }) {
  const [value, setValue] = useState(product.ds_price?.toString() ?? "");
  const [editing, setEditing] = useState(false);
  const EditProductMutation = useEditProduct();

  const handleEditProductPrice = () => {
    EditProductMutation.mutate(
      {
        input: {
          ...product,
          ds_price: value === "" ? null : Number(value),
          ...(product.categories?.length
            ? { category_ids: product.categories.map((c) => c.id) }
            : {}),
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
          brand_id: product.brand.id,
        },
        id: product.id,
      },
      {
        onSuccess(data, variables, context) {
          toast.success("Update product price successful");
          setEditing(false);
        },
        onError(error, variables, context) {
          toast.error("Update product price fail");
        },
      },
    );
  };

  return (
    <div className="flex justify-center">
      {editing ? (
        <Input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            if (Number(value) !== product.ds_price) {
              // optional: auto save
            } else {
              setEditing(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleEditProductPrice();
            }
            if (e.key === "Escape") {
              setValue(product.ds_price?.toString() ?? "");
              setEditing(false);
            }
          }}
          autoFocus
          disabled={EditProductMutation.isPending}
          className={cn(
            "w-28",
            EditProductMutation.isPending ? "cursor-wait" : "cursor-text",
          )}
        />
      ) : (
        <div
          className="cursor-pointer"
          onClick={() => setEditing(true)}
        >
          {product.ds_price ? (
            <div className="text-right">€{product.ds_price?.toFixed(2)}</div>
          ) : (
            <div className="text-center">—</div>
          )}
        </div>
      )}
    </div>
  );
}

function EditDeliveryChargeCell({ product }: { product: ProductItem }) {
  const [value, setValue] = useState(product.delivery_charge?.toString() ?? "");
  const [editing, setEditing] = useState(false);
  const EditProductMutation = useEditProduct();

  const handleEditProductPrice = () => {
    EditProductMutation.mutate(
      {
        input: {
          ...product,
          delivery_charge: value === "" ? null : Number(value),
          ...(product.categories?.length
            ? { category_ids: product.categories.map((c) => c.id) }
            : {}),
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
          brand_id: product.brand.id,
        },
        id: product.id,
      },
      {
        onSuccess(data, variables, context) {
          toast.success("Update product delivery charge successful");
          setEditing(false);
        },
        onError(error, variables, context) {
          toast.error("Update product delivery charge fail");
        },
      },
    );
  };

  return (
    <div className="flex justify-center">
      {editing ? (
        <Input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            if (Number(value) !== product.delivery_charge) {
              // optional: auto save
            } else {
              setEditing(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleEditProductPrice();
            }
            if (e.key === "Escape") {
              setValue(product.delivery_charge?.toString() ?? "");
              setEditing(false);
            }
          }}
          autoFocus
          disabled={EditProductMutation.isPending}
          className={cn(
            "w-28",
            EditProductMutation.isPending ? "cursor-wait" : "cursor-text",
          )}
        />
      ) : (
        <div
          className="cursor-pointer"
          onClick={() => setEditing(true)}
        >
          {product.delivery_charge ? (
            <div className="text-right">
              €{product.delivery_charge?.toFixed(2)}
            </div>
          ) : (
            <div className="text-center">—</div>
          )}
        </div>
      )}
    </div>
  );
}

export const getDsPriceColumn = (
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
    accessorKey: "id",
    header: ({}) => <div className="text-center">ID</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.original.id_provider}</div>;
    },
  },
  {
    accessorKey: "name",
    meta: { width: "400px" },
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
      <div className="line-clamp-2 w-[300px] text-wrap">
        {row.original.name}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "sku",
    header: ({}) => <div className="text-center">SKU</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.original.sku}</div>;
    },
  },
  {
    accessorKey: "ean",
    header: ({}) => <div className="text-center">EAN</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.original.ean ? (
            row.original.ean
          ) : (
            <div className="text-center">—</div>
          )}
        </div>
      );
    },
  },

  // ✅ Cột STOCK — thêm sort server-side logic ở đây
  {
    accessorKey: "stock",
    header: ({ column }) => {
      const direction = column.getIsSorted() as "asc" | "desc" | undefined;

      return (
        <Button
          variant="ghost"
          className="font-semibold flex items-center px-0 justify-center gap-1 w-fit"
          onClick={() => {
            // toggleSorting sẽ tự xử lý asc/desc/undefined xoay vòng
            column.toggleSorting(direction === "asc");

            // Đợi 1 tick để state cập nhật rồi sync với API param
            setTimeout(() => {
              const newDir = column.getIsSorted() as "asc" | "desc" | undefined;
              setSortByStock(newDir);
            }, 0);
          }}
        >
          <div>STOCK</div>
          <div className="mb-0.5">
            {direction === "asc" ? "↑" : direction === "desc" ? "↓" : "↕"}
          </div>
        </Button>
      );
    },
    cell: ({ row }) => {
      const stock = row.original.stock;
      const result_stock = row.original.result_stock;
      const toNum = (v: any) => (isFinite(Number(v)) ? Number(v) : 0);

      const s = toNum(stock);
      const r = toNum(result_stock);

      const computedStock = s - Math.abs(r);

      return (
        <div
          className={cn(
            "text-center text-white rounded-xl px-2 py-1",
            row.original.stock === 0
              ? "bg-red-500 text-white"
              : row.original.stock < 10
                ? "bg-gray-400"
                : row.original.stock <= 20
                  ? "bg-primary"
                  : "bg-secondary",
          )}
        >
          {computedStock} pcs.
        </div>
      );
    },
    enableSorting: true,
  },

  {
    accessorKey: "cost",
    header: () => <div className="text-center">COST</div>,
    cell: ({ row }) => (
      <>
        {row.original.cost ? (
          <div className="text-right">€{row.original.cost.toFixed(2)}</div>
        ) : (
          <div className="text-center">—</div>
        )}
      </>
    ),
  },

  {
    id: "carrier",
    header: () => <div className="text-center">CARRIER</div>,
    cell: ({ row }) => {
      const carrier = row.original.carrier;
      const logo = getCarrierLogo(carrier);

      return (
        <div className="flex items-center justify-center">
          {logo ? (
            <Image
              src={logo}
              alt={carrier}
              width={60}
              height={60}
              unoptimized
              className="object-contain"
            />
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "delivery_charge",
    header: () => <div className="text-center">DELIVERY CHARGE</div>,
    cell: ({ row }) => <EditDeliveryChargeCell product={row.original} />,
  },
  {
    accessorKey: "final_price",
    header: () => <div className="text-center">FINAL PRICE</div>,
    cell: ({ row }) => (
      <>
        {row.original.final_price ? (
          <div className="text-right">
            €{row.original.final_price.toFixed(2)}
          </div>
        ) : (
          <div className="text-center">—</div>
        )}
      </>
    ),
  },

  {
    accessorKey: "ds_price",
    header: () => <div className="text-center">DS PRICE</div>,
    cell: ({ row }) => <EditDSPriceCell product={row.original} />,
  },

  {
    accessorKey: "markup_price",
    header: () => <div className="text-center">MARKUP PRICE</div>,
    cell: ({ row }) => {
      return (
        <>
          {row.original.ds_price ? (
            <div className="text-center">
              {(
                ((row.original.ds_price - row.original.cost) /
                  row.original.cost) *
                  100 +
                100
              ).toFixed(2)}
              %
            </div>
          ) : (
            <div className="text-center">—</div>
          )}
        </>
      );
    },
  },

  //   {
  //     id: "actions",
  //     header: "ACTION",
  //     cell: ({ row }) => <ActionsCell product={row.original} />,
  //   },
];
