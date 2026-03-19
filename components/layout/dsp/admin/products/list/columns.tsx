"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductItem } from "@/types/products";
import { useState } from "react";
import { useEditProduct } from "@/features/products/hook";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { useLocale } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { getProductByIdDSP } from "@/features/dsp/products/api";
import DeleteDialogDSP from "./delete-dialog";

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
          brand_id: product.brand ? product.brand.id : null,
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

  return <div className="text-right">€{product.final_price?.toFixed(2)}</div>;
}

function ActionsCell({ product }: { product: ProductItem }) {
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleClick = async (id: string) => {
    try {
      await queryClient.prefetchQuery({
        queryKey: ["dsp-product", id],
        queryFn: () => getProductByIdDSP(id),
      });
      router.push(`/dsp/admin/products/${id}/edit`, { locale });
    } catch (err) {
      console.error("Prefetch failed:", err);
      // router.push(`/dsp/admin/products/${id}/edit`, { locale });
    }
  };

  return (
    <div className="flex gap-2">
      {/* <Link href={`/admin/products/${product.id}/edit`}> */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleClick(product.id)}
      >
        <Pencil className="w-4 h-4 text-primary" />
      </Button>
      {/* </Link> */}
      {/* <DeleteDialogDSP product={product} /> */}
    </div>
  );
}

export const productColumnsDSP: ColumnDef<ProductItem>[] = [
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
    header: "ICON",
    cell: ({ row }) => {
      const image = row.original.static_files?.[0]?.url;
      return (
        <div className="w-12 h-12 relative">
          {image ? (
            <Image
              src={image}
              alt="icon"
              fill
              className="object-cover rounded-md"
              sizes="60px"
              unoptimized
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-md" />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "NAME",
    // cell: ({ row }) => <EditableNameCell product={row.original} />,
    cell: ({ row }) => (
      <div className="w-60 text-wrap">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "category",
    header: "CATEGORY",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-1 items-center">
          {row.original.categories.map((item, indx) => {
            return <div key={item.id}>{item.name}</div>;
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "stock",
    header: "STOCK",
    // cell: ({ row }) => <EditableStockCell product={row.original} />,
    cell: ({ row }) => (
      <div className="text-center">{row.original.stock} pcs.</div>
    ),
  },
  {
    accessorKey: "is_active",
    header: "STATUS",
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded-md text-xs ${
          row.original.is_active
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {row.original.is_active ? "active" : "inactive"}
      </span>
      // <ToogleProductStatus product={row.original} />
    ),
  },
  {
    accessorKey: "cost",
    header: () => <div className="text-right">COST</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.cost ? (
          <span>€{row.original.cost.toFixed(2)}</span>
        ) : (
          "updating"
        )}
      </div>
    ),
  },
  {
    accessorKey: "shipping_cost",
    header: () => <div className="text-right">DELIVERY COST</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.delivery_cost ? (
          <>€{row.original.delivery_cost?.toFixed(2)}</>
        ) : (
          "updating"
        )}
      </div>
    ),
  },
  {
    accessorKey: "final_price",
    header: () => <div className="text-right">FINAL PRICE</div>,
    cell: ({ row }) => <EdittbalePriceCell product={row.original} />,
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
  {
    id: "carrier",
    header: () => <div className="text-center">CARRIER</div>,
    cell: ({ row }) => {
      const carrier = row.original.carrier?.toLowerCase();

      let image: string | null = null;
      if (carrier === "amm" || carrier === "spedition") {
        image = "/amm.jpeg";
      } else if (carrier === "dpd") {
        image = "/dpd.jpeg";
      }

      return (
        <div className="flex items-center justify-center">
          {image ? (
            <Image
              src={image}
              alt={carrier}
              width={60}
              height={60}
              unoptimized
              className="object-fill"
            />
          ) : (
            <div>updating</div>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-start">ACTION</div>,
    cell: ({ row }) => <ActionsCell product={row.original} />,
  },
  // {
  //     id: 'sync',
  //     header: "EBAY",
  //     cell: ({ row }) => {
  //         return (
  //             <SyncToEbay product={row.original} />
  //         )
  //     }
  // }
];
