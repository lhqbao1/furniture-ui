"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductItem } from "@/types/products";
import { useState } from "react";
import { useEditProduct } from "@/features/products/hook";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import SyncToEbayForm from "./sync-to-ebay-form";
import RemoveFromMarketplaceDialog from "./remove-dialog";
import SyncToAmazonForm from "./ync-to-amazon-form";

const MARKETPLACES = ["kaufland", "ebay", "amazon"] as const;
type Marketplace = (typeof MARKETPLACES)[number];

function ToggleProductStatus({ product }: { product: ProductItem }) {
  const editProductMutation = useEditProduct();

  const handleToggleStatus = () => {
    const missingFields: string[] = [];

    if (product.static_files.length === 0) missingFields.push("Images");
    if (!product.name) missingFields.push("Product name");
    if (!product.final_price) missingFields.push("Final price");
    if (!product.cost) missingFields.push("Net Purchase Cost");
    if (!product.delivery_cost) missingFields.push("Delivery cost");
    if (!product.brand) missingFields.push("Brand");
    if (!product.delivery_time) missingFields.push("Delivery time");
    if (!product.carrier) missingFields.push("Carrier");
    if (product.categories.length === 0) missingFields.push("Categories");

    const isIncomplete = missingFields.length > 0;

    if (isIncomplete && product.is_active === false) {
      toast.error("Product information is incomplete", {
        description: `Missing: ${missingFields.join(", ")}`,
      });
      return;
    }

    editProductMutation.mutate(
      {
        input: {
          ...product,
          is_active: !product.is_active,
          category_ids: product.categories.map((c) => c.id), // map ra id array
          ...(product.brand?.id ? { brand_id: product.brand.id } : {}),
          bundles:
            product.bundles && product.bundles.length > 0
              ? product.bundles.map((item) => ({
                  product_id: item.bundle_item.id,
                  quantity: item.quantity,
                }))
              : null,
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
      onCheckedChange={handleToggleStatus}
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
  const [updating, setUpdating] = useState<boolean>(false);

  // ✅ Tách marketplace cụ thể ra, tránh find() lặp
  const marketplaceProduct = product.marketplace_products?.find(
    (p) => p.marketplace === marketplace,
  );

  // ✅ Button UI logic rõ ràng
  const isActive = marketplaceProduct?.is_active;

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
            isAdd
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

function AddProductMarketplace({
  product,
  marketplace,
}: {
  product: ProductItem;
  marketplace: string;
}) {
  const [updating, setUpdating] = useState<boolean>(false);
  return (
    <div className="flex justify-center">
      <SyncToEbayForm
        setUpdating={setUpdating}
        product={product}
        isUpdating={false}
        currentMarketplace={marketplace}
      />
    </div>
  );
}

const MARKETPLACE_ORDER = ["kaufland", "ebay", "amazon"];

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
    meta: { width: 200 },
    header: ({ column }) => (
      <Button
        variant={"ghost"}
        className=" flex items-center px-0 justify-center gap-1 w-fit"
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
    cell: ({ row }) => <div className="text-wrap">{row.original.name}</div>,
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
    meta: { width: 120 },
    header: ({ column }) => <div className="text-center">EAN</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center text-wrap truncate">{row.original.ean}</div>
      );
    },
  },
  {
    accessorKey: "owner",
    meta: { width: 200 },
    header: ({ column }) => <div className="text-center">SUPPLIER</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center text-wrap">
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
          className=" flex items-center px-0 justify-center gap-1 w-fit"
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
    cell: ({ row }) => <ToggleProductStatus product={row.original} />,
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

const MARKETPLACE_ICONS: Record<Marketplace, string> = {
  amazon: "/amazon.png",
  kaufland: "/kau.png",
  ebay: "/ebay.png",
};

// const marketplaceBaseColumn: ColumnDef<ProductItem> = {
//   id: "marketplace",
//   header: () => <div className="text-center uppercase">MARKETPLACE</div>,
//   cell: ({ row }) => <AddProductMarketplace product={row.original} />,
// };

const marketplaceColumns: ColumnDef<ProductItem>[] = MARKETPLACES.map(
  (marketplace) => ({
    id: marketplace,
    header: () => (
      <div className="flex justify-center items-center uppercase">
        <Image
          src={MARKETPLACE_ICONS[marketplace]}
          alt={marketplace}
          width={60}
          height={50}
          className="object-contain h-full"
        />
      </div>
    ),
    cell: ({ row }) => {
      const product = row.original;

      const hasMarketplace = product.marketplace_products?.some(
        (m) => m.marketplace === marketplace,
      );

      return (
        <div className="flex justify-center text-center text-sm font-medium">
          {hasMarketplace ? (
            <SyncToMarketplace product={product} marketplace={marketplace} />
          ) : !product.is_active ? (
            <div>Product is inactive</div>
          ) : (
            <AddProductMarketplace
              product={row.original}
              marketplace={marketplace}
            />
          )}
        </div>
      );
    },
  }),
);

// export const productMarketplaceColumns = (
//   products: ProductItem[],
//   setSortByStock: (val?: "asc" | "desc") => void,
// ): ColumnDef<ProductItem>[] => {
//   // Lấy danh sách marketplace duy nhất từ toàn bộ product
//   const marketplaces = Array.from(
//     new Set(
//       products
//         .flatMap((p) => p.marketplace_products?.map((m) => m.marketplace))
//         .filter(Boolean),
//     ),
//   );

//   // Cột cố định cho marketplace
//   const fixedMarketplaceColumn: ColumnDef<ProductItem> = {
//     id: "marketplace",
//     header: () => <div className="text-center  uppercase">MARKETPLACE</div>,
//     cell: ({ row }) => {
//       const product = row.original;
//       return <AddProductMarketplace product={product} />;
//     },
//   };

//   const safeMarketplaces = Array.isArray(marketplaces)
//     ? marketplaces.filter(
//         (m): m is string => typeof m === "string" && m.trim().length > 0,
//       )
//     : [];

//   // Các cột động theo marketplace thực tế
//   const dynamicMarketplaceColumns: ColumnDef<ProductItem>[] = safeMarketplaces
//     .sort((a, b) => {
//       const indexA = MARKETPLACE_ORDER.indexOf(a.toLowerCase());
//       const indexB = MARKETPLACE_ORDER.indexOf(b.toLowerCase());

//       // marketplace không nằm trong list → đẩy xuống cuối
//       return (
//         (indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA) -
//         (indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB)
//       );
//     })
//     .map((marketplace) => ({
//       id: marketplace,
//       header: () => {
//         const key = marketplace.toLowerCase();

//         const icons: Record<string, string> = {
//           amazon: "/amazon.png",
//           kaufland: "/kau.png",
//           ebay: "/ebay.png",
//         };

//         const iconSrc = icons[key];

//         return (
//           <div className="flex justify-center items-center uppercase">
//             {iconSrc ? (
//               <Image
//                 src={iconSrc}
//                 alt={marketplace}
//                 width={60}
//                 height={50}
//                 className="object-contain h-full"
//               />
//             ) : (
//               marketplace
//             )}
//           </div>
//         );
//       },
//       cell: ({ row }) => {
//         const product = row.original;
//         const hasMarketplace = product.marketplace_products?.some(
//           (m) => m.marketplace === marketplace,
//         );

//         return (
//           <div className="flex justify-center text-center text-sm font-medium">
//             {hasMarketplace ? (
//               <SyncToMarketplace product={product} marketplace={marketplace} />
//             ) : !product.is_active ? (
//               <div>Product is inactive</div>
//             ) : (
//               <div>No {marketplace} data</div>
//             )}
//           </div>
//         );
//       },
//     }));

//   return [
//     ...baseColumns(setSortByStock), // ✅ gọi hàm để lấy array
//     fixedMarketplaceColumn,
//     ...dynamicMarketplaceColumns,
//   ];
// };

export const productMarketplaceColumns = (
  setSortByStock: (val?: "asc" | "desc") => void,
): ColumnDef<ProductItem>[] => {
  return [
    ...baseColumns(setSortByStock),
    // marketplaceBaseColumn,
    ...marketplaceColumns,
  ];
};
