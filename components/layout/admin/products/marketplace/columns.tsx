"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductItem } from "@/types/products";
import { useState } from "react";
import { useEditProduct } from "@/features/products/hook";
import { toast } from "sonner";
import { useRemoveFormEbay, useSyncToEbay } from "@/features/ebay/hook";
import { stripHtmlRegex } from "@/hooks/simplifyHtml";
import { Switch } from "@/components/ui/switch";
import SyncToEbayForm from "./sync-to-ebay-form";
import { syncToEbayInput } from "@/features/ebay/api";
import { syncToKauflandInput } from "@/features/kaufland/api";
import {
  useRemoveFormKaufland,
  useSyncToKaufland,
} from "@/features/kaufland/hook";
import RemoveFromMarketplaceDialog from "./remove-dialog";
import { useSyncToAmazon } from "@/features/amazon/hook";
import SyncToAmazonForm from "./ync-to-amazon-form";

function ToogleProductStatus({ product }: { product: ProductItem }) {
  const editProductMutation = useEditProduct();
  const handleToogleStatus = () => {
    editProductMutation.mutate(
      {
        input: {
          ...product,
          is_active: !product.is_active,
          brand_id: product.brand.id,
          category_ids: product.categories.map((c) => c.id), // map ra id array
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
          toast.success("Update product status successful");
        },
        onError(error, variables, context) {
          toast.error("Update product status fail");
        },
      },
    );
  };

  return (
    <Switch
      checked={product.is_active}
      onCheckedChange={handleToogleStatus}
      disabled={editProductMutation.isPending}
      className="data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-secondary cursor-pointer"
    />
  );
}

function SyncToMarketplace({
  product,
  marketplace,
}: {
  product: ProductItem;
  marketplace: string;
}) {
  const syncToEbayMutation = useSyncToEbay();
  const syncToKauflandMutation = useSyncToKaufland();
  const syncToAmazonMutation = useSyncToAmazon();

  const removeFromEbayMutation = useRemoveFormEbay();
  const removeFromKauflandMutation = useRemoveFormKaufland();

  const [openUpdateMarketplaceDialog, setOpenUpdateMarketplaceDialog] =
    useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);

  // ✅ Tách marketplace cụ thể ra, tránh find() lặp
  const marketplaceProduct = product.marketplace_products?.find(
    (p) => p.marketplace === marketplace,
  );

  // ✅ Button UI logic rõ ràng
  const isActive = marketplaceProduct?.is_active;

  const isSyncing =
    syncToEbayMutation.isPending ||
    syncToKauflandMutation.isPending ||
    syncToAmazonMutation.isPending ||
    removeFromEbayMutation.isPending ||
    removeFromKauflandMutation.isPending;

  return (
    <div className="flex justify-start gap-2 items-center">
      {/* Nếu product active trong marketplace => hiện form update */}
      {isActive ? (
        // 🔹 CASE 1: Product đã active trên marketplace
        marketplace === "amazon" ? (
          <>
            <SyncToAmazonForm
              updating={updating}
              setUpdating={setUpdating}
              product={product}
              isUpdating
              currentMarketplace={marketplace}
              isActive={isActive ?? false}
            />
          </>
        ) : (
          <SyncToEbayForm
            updating={updating}
            setUpdating={setUpdating}
            product={product}
            isUpdating
            currentMarketplace={marketplace}
          />
        )
      ) : // 🔹 CASE 2: Product CHƯA active — kiểm tra marketplace
      marketplace === "amazon" ? (
        <>
          <SyncToAmazonForm
            updating={updating}
            setUpdating={setUpdating}
            product={product}
            currentMarketplace={marketplace}
            isActive={isActive ?? false}
          />
        </>
      ) : (
        <>
          <SyncToEbayForm
            updating={updating}
            setUpdating={setUpdating}
            product={product}
            isAdd
            currentMarketplace={marketplace}
          />
          {/* <Button
            onClick={handleSync}
            variant="outline"
            disabled={isSyncing}
            className="min-w-[80px]"
          >
            {isSyncing ? <Loader2 className="animate-spin" /> : "Sync"}
          </Button> */}
        </>
      )}

      {/* Nếu đang active => nút Remove */}
      {isActive && (
        <RemoveFromMarketplaceDialog
          marketplace={marketplace}
          marketplaceProduct={marketplaceProduct}
          product={product}
        />
      )}
    </div>
  );
}

function AddProductMarketplace({ product }: { product: ProductItem }) {
  const [openAddMarketplaceDialog, setOpenAddMarketplaceDialog] =
    useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  return (
    <div className="flex justify-center">
      <SyncToEbayForm
        setUpdating={setUpdating}
        product={product}
        isUpdating={false}
      />
    </div>
  );
}

export const baseColumns = (
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
    accessorKey: "sku",
    header: ({ column }) => <div className="text-center">SKU</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.original.sku}</div>;
    },
  },
  {
    accessorKey: "ean",
    header: ({ column }) => <div className="text-center">EAN</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.original.ean}</div>;
    },
  },
  {
    accessorKey: "owner",
    header: ({ column }) => <div className="text-center">SUPPLIER</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.original.owner?.business_name
            ? row.original.owner?.business_name
            : "Prestige Home"}
        </div>
      );
    },
  },
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
    cell: ({ row }) => <div>{row.original.stock} pcs.</div>,
    enableSorting: true,
  },
  {
    accessorKey: "is_active",
    header: "STATUS",
    cell: ({ row }) => <ToogleProductStatus product={row.original} />,
  },
  {
    accessorKey: "final_price",
    header: () => <div className="text-right">FINAL PRICE</div>,
    cell: ({ row }) => (
      <div>
        {row.original.final_price ? (
          <div className="text-right">
            €{row.original.final_price?.toFixed(2)}
          </div>
        ) : (
          <div className="text-right">updating</div>
        )}
      </div>
    ),
  },
];

export const productMarketplaceColumns = (
  products: ProductItem[],
  setSortByStock: (val?: "asc" | "desc") => void,
): ColumnDef<ProductItem>[] => {
  // Lấy danh sách marketplace duy nhất từ toàn bộ product
  const marketplaces = Array.from(
    new Set(
      products
        .flatMap((p) => p.marketplace_products?.map((m) => m.marketplace))
        .filter(Boolean),
    ),
  );

  // Cột cố định cho marketplace
  const fixedMarketplaceColumn: ColumnDef<ProductItem> = {
    id: "marketplace",
    header: () => (
      <div className="text-center font-semibold uppercase">MARKETPLACE</div>
    ),
    cell: ({ row }) => {
      const product = row.original;
      return <AddProductMarketplace product={product} />;
    },
  };

  // Các cột động theo marketplace thực tế
  const dynamicMarketplaceColumns: ColumnDef<ProductItem>[] = marketplaces.map(
    (marketplace) => ({
      id: marketplace,
      header: () => (
        <div className="text-center font-semibold uppercase">{marketplace}</div>
      ),
      cell: ({ row }) => {
        const product = row.original;
        const hasMarketplace = product.marketplace_products?.some(
          (m) => m.marketplace === marketplace,
        );

        return (
          <div
            className={`flex justify-center text-center text-sm font-medium 
                            }`}
          >
            {hasMarketplace ? (
              product.is_active ? (
                // ✅ Có marketplace + active → hiển thị nút Sync
                <SyncToMarketplace
                  product={product}
                  marketplace={marketplace}
                />
              ) : (
                // ✅ Có marketplace + inactive → hiển thị nút Remove
                <div className="text-center">Product is inactive</div>
              )
            ) : !product.is_active ? (
              // ❌ Không có marketplace + inactive
              <div className="text-center">Product is inactive</div>
            ) : (
              // ❌ Không có marketplace + active
              <div className="text-center">No {marketplace} data</div>
            )}
          </div>
        );
      },
    }),
  );

  return [
    ...baseColumns(setSortByStock), // ✅ gọi hàm để lấy array
    fixedMarketplaceColumn,
    ...dynamicMarketplaceColumns,
  ];
};
