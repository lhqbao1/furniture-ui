"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductItem } from "@/types/products";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { useState } from "react";
import { useEditProduct } from "@/features/products/hook";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function EdittbalePriceCell({ product }: { product: ProductItem }) {
  const [value, setValue] = useState(product.final_price);
  const [editing, setEditing] = useState(false);
  const EditProductMutation = useEditProduct();

  const handleEditProductPrice = () => {
    EditProductMutation.mutate(
      {
        input: {
          ...product,
          final_price: value,
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
    <div className="text-right flex justify-end">
      {editing ? (
        <Input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.valueAsNumber)}
          onBlur={() => {
            if (value !== product.final_price) {
            } else {
              setEditing(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleEditProductPrice();
            }
            if (e.key === "Escape") {
              setValue(product.final_price);
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
          {product.final_price ? (
            <div className="text-right">€{product.final_price?.toFixed(2)}</div>
          ) : (
            <div className="text-right">updating</div>
          )}
        </div>
      )}
    </div>
  );
}

function EditMarketplacePriceField({
  product,
  marketplace,
}: {
  product: ProductItem;
  marketplace: string;
}) {
  const marketplaceKey = marketplace.toLowerCase();

  const marketplaceProduct = product.marketplace_products?.find(
    (i) =>
      typeof i.marketplace === "string" &&
      i.marketplace.toLowerCase() === marketplaceKey,
  );
  const [value, setValue] = useState<number | undefined>(
    marketplaceProduct?.final_price,
  );

  const [editing, setEditing] = useState(false);
  const EditProductMutation = useEditProduct();

  const updatedMarketplaceProducts =
    product.marketplace_products?.map((item) =>
      item.marketplace?.toLowerCase() === marketplaceKey
        ? {
            ...item,
            final_price: value,
          }
        : item,
    ) ?? [];
  const handleEditProductPrice = () => {
    if (value == null || value === marketplaceProduct?.final_price) {
      setEditing(false);
      return;
    }
    EditProductMutation.mutate(
      {
        input: {
          ...product,
          final_price: value,
          marketplace_products: updatedMarketplaceProducts,
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
        },
        id: product.id,
      },
      {
        onSuccess(data, variables, context) {
          toast.success(`Update ${marketplace} price successful`);
          setEditing(false);
        },
        onError(error, variables, context) {
          toast.error(`Update ${marketplace} price failed`);
        },
      },
    );
  };

  return (
    <div className="text-right flex justify-end">
      {editing ? (
        <Input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.valueAsNumber)}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleEditProductPrice();
            if (e.key === "Escape") {
              setValue(marketplaceProduct?.final_price);
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
          {marketplaceProduct?.final_price != null
            ? marketplaceProduct.final_price.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : "—"}
        </div>
      )}
    </div>
  );
}

export const getMatchingPriceColumn = (
  setSortByStock: (val?: "asc" | "desc") => void,
): ColumnDef<ProductItem>[] => [
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
      <div className="max-w-60 w-60 text-wrap">{row.original.name}</div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "cost",
    header: () => <div className="text-right">COST</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.cost ? (
          <span>
            €
            {row.original.cost.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ) : (
          <div className="text-right">updating</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "final_price",
    header: () => <div className="text-right">FINAL PRICE</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.final_price ? (
          <EdittbalePriceCell product={row.original} />
        ) : (
          <div className="text-right">updating</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "kaufland_price",
    header: () => <div className="text-right">KAUFLAND PRICE</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <EditMarketplacePriceField
          product={row.original}
          marketplace="kaufland"
        />
      </div>
    ),
  },
  {
    accessorKey: "amazon_price",
    header: () => <div className="text-right">AMAZON PRICE</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <EditMarketplacePriceField
          product={row.original}
          marketplace="amazon"
        />
      </div>
    ),
  },
  {
    accessorKey: "ebay_price",
    header: () => <div className="text-right">EBAY PRICE</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <EditMarketplacePriceField
          product={row.original}
          marketplace="ebay"
        />
      </div>
    ),
  },

  {
    id: "margin",
    header: () => <div className="text-right">MARGIN</div>,
    cell: ({ row }) => {
      const { final_price, cost, tax } = row.original;
      const taxRate = parseFloat(tax) / 100;
      if (!final_price || !cost || final_price <= 0)
        return <div className="text-right">updating</div>;

      const margin = (1 / (1 + taxRate) - cost / final_price) * 100;
      return <div className="text-right">{margin.toFixed(1)}%</div>;
    },
  },

  //   {
  //     id: "actions",
  //     header: "ACTION",
  //     cell: ({ row }) => <ActionsCell product={row.original} />,
  //   },
];
