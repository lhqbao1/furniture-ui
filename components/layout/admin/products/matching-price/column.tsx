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
import { useSyncToEbay } from "@/features/ebay/hook";
import { useSyncToKaufland } from "@/features/kaufland/hook";
import { useSyncToAmazon } from "@/features/amazon/hook";
import { syncToKauflandInput } from "@/features/kaufland/api";
import { syncToEbayInput } from "@/features/ebay/api";
import { stripHtmlRegex } from "@/hooks/simplifyHtml";
import { SyncToAmazonInput } from "@/features/amazon/api";

function EdittbalePriceCell({ product }: { product: ProductItem }) {
  const [value, setValue] = useState(product.final_price);
  const [editing, setEditing] = useState(false);
  const EditProductMutation = useEditProduct();

  const isHigher = product.marketplace_products.find(
    (i) => i.final_price < product.final_price,
  );

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
    <div className="text-center flex justify-center">
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
            <div
              className={`text-center ${
                isHigher ? "text-red-600" : "text-secondary"
              }`}
            >
              €{product.final_price?.toFixed(2)}
            </div>
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
  const syncToEbayMutation = useSyncToEbay();
  const syncToKauflandMutation = useSyncToKaufland();
  const syncToAmazonMutation = useSyncToAmazon();

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
          const kauflandPayload: syncToKauflandInput = {
            ean: product.ean,
            title: marketplaceProduct?.name ?? product.name,
            description: marketplaceProduct?.description ?? product.description,
            image_urls:
              product.static_files?.map((f) => f.url.replace(/\s+/g, "%20")) ??
              [],
            price: marketplaceProduct?.final_price ?? product.final_price,
            stock: product.stock,
            carrier: product.carrier,
            sku: product.id_provider,
            product_id: product.id,
            ...(marketplaceProduct?.min_stock !== undefined && {
              min_stock: marketplaceProduct.min_stock,
            }),
            ...(marketplaceProduct?.max_stock !== undefined && {
              max_stock: marketplaceProduct.max_stock,
            }),
            marketplace_offer_id: marketplaceProduct?.marketplace_offer_id,
            brand: {
              address: product.brand.company_address,
              email: product.brand.company_email,
              name: product.brand.company_name,
              phone: product.brand.company_phone,
            },
            handling_time: marketplaceProduct?.handling_time ?? 0,
          };

          const ebayPayload: syncToEbayInput = {
            price: marketplaceProduct?.final_price ?? product.final_price,
            sku: product.id_provider,
            stock: product.stock,
            tax: product.tax ? product.tax : null,
            product: {
              description: stripHtmlRegex(
                marketplaceProduct?.description ?? product.description,
              ),
              title: marketplaceProduct?.name ?? product.name,
              imageUrls:
                product.static_files?.map((file) =>
                  file.url.replace(/\s+/g, "%20"),
                ) ?? [],
              ean: product.ean ? [product.ean] : [],
            },
            carrier: product.carrier,
            brand: product.brand ? product.brand.name : "",
            ...(marketplaceProduct?.min_stock !== undefined && {
              min_stock: marketplaceProduct.min_stock,
            }),
            ...(marketplaceProduct?.max_stock !== undefined && {
              max_stock: marketplaceProduct.max_stock,
            }),
            manufacturer: {
              name: product.brand.company_name,
              address: product.brand.company_address,
              city: product.brand.company_city,
              country: product.brand.company_country,
              email: product.brand.company_email,
              postal_code: product.brand.company_postal_code,
              phone: product.brand.company_phone,
            },
            documents:
              product.pdf_files && product.pdf_files.length > 0
                ? product.pdf_files
                : null,
            ebay_offer_id: marketplaceProduct?.marketplace_offer_id ?? "",
          };

          const amazonPayload: SyncToAmazonInput = {
            sku: marketplaceProduct?.sku ?? product.id_provider,
            title: marketplaceProduct?.name ?? product.name,
            manufacturer: product.brand ? product.brand.company_name : "",
            description: marketplaceProduct?.description ?? product.description,
            price: marketplaceProduct?.final_price ?? product.final_price,
            ean: product.ean,
            part_number: product.sku,
            is_fragile: false,
            number_of_items: Number(product.amount_unit) || 0,
            included_components: product.name,
            weight: product.weight,
            height: product.height,
            width: product.width,
            length: product.length,
            package_length: Math.max(
              ...product.packages.map((p) => p.length ?? 0),
            ),
            package_height: Math.max(
              ...product.packages.map((p) => p.height ?? 0),
            ),
            package_width: Math.max(
              ...product.packages.map((p) => p.width ?? 0),
            ),
            color: product.color ?? "",
            unit_count: Number(product.amount_unit ?? 0),
            unit_count_type: product.unit,
            depth: 0,
            asin: null,
            stock: product.stock,
            carrier: product.carrier,
            brand: product.brand ? product.brand.name : "",
            images: product.static_files?.map((f) => f.url) ?? [],
            model_number: product.sku,
            size: `${product.length}x${product.width}x${product.height}`,
            country_of_origin: marketplaceProduct?.country_of_origin ?? "",
            min_stock: marketplaceProduct?.min_stock ?? 0,
            max_stock: marketplaceProduct?.max_stock ?? 10,
            handling_time: marketplaceProduct?.handling_time ?? 0,
            bullet_point1: product.bullet_point_1,
            bullet_point2: product.bullet_point_2,
            bullet_point3: product.bullet_point_3,
            bullet_point4: product.bullet_point_4,
            bullet_point5: product.bullet_point_5,
          };

          if (marketplaceKey === "kaufland") {
            syncToKauflandMutation.mutate(kauflandPayload);
          } else if (marketplaceKey === "ebay") {
            syncToEbayMutation.mutate(ebayPayload);
          } else if (marketplaceKey === "amazon") {
            syncToAmazonMutation.mutate(amazonPayload);
          }
        },
        onError(error, variables, context) {
          toast.error(`Update ${marketplace} price failed`);
        },
      },
    );
  };

  return (
    <div className="text-center flex justify-center">
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
          {marketplaceProduct?.final_price != null ? (
            <>
              €
              {marketplaceProduct.final_price.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </>
          ) : (
            "—"
          )}
        </div>
      )}
    </div>
  );
}

export const getMatchingPriceColumn = (
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
      <div className="max-w-60 w-60 text-wrap">{row.original.name}</div>
    ),
    enableSorting: true,
  },
  // {
  //   accessorKey: "cost",
  //   header: () => <div className="text-right">COST</div>,
  //   cell: ({ row }) => (
  //     <div className="text-right">
  //       {row.original.cost ? (
  //         <span>
  //           €
  //           {row.original.cost.toLocaleString("de-DE", {
  //             minimumFractionDigits: 2,
  //             maximumFractionDigits: 2,
  //           })}
  //         </span>
  //       ) : (
  //         <div className="text-right">updating</div>
  //       )}
  //     </div>
  //   ),
  // },
  {
    accessorKey: "final_price",
    header: () => (
      <div className="flex justify-center">
        <Image
          src={"/invoice-logo.png"}
          width={40}
          height={40}
          alt="prestige-home"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.final_price ? (
          <EdittbalePriceCell product={row.original} />
        ) : (
          <div className="text-center">-</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "kaufland_price",
    header: () => (
      <div className="flex justify-center">
        <Image
          src={"/kau.png"}
          width={50}
          height={80}
          alt="kaufland"
          className="w-20 h-auto object-contain"
        />
      </div>
    ),
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
    header: () => (
      <div className="flex justify-center">
        <Image
          src={"/amazon.png"}
          width={50}
          height={50}
          alt="amazon"
          className="w-16 h-auto object-contain"
        />
      </div>
    ),
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
    header: () => (
      <div className="flex justify-center">
        <Image
          src={"/ebay.png"}
          width={50}
          height={50}
          alt="ebay"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right">
        <EditMarketplacePriceField
          product={row.original}
          marketplace="ebay"
        />
      </div>
    ),
  },

  // {
  //   id: "margin",
  //   header: () => <div className="text-right">MARGIN</div>,
  //   cell: ({ row }) => {
  //     const { final_price, cost, tax } = row.original;
  //     const taxRate = parseFloat(tax) / 100;
  //     if (!final_price || !cost || final_price <= 0)
  //       return <div className="text-right">updating</div>;

  //     const margin = (1 / (1 + taxRate) - cost / final_price) * 100;
  //     return <div className="text-right">{margin.toFixed(1)}%</div>;
  //   },
  // },

  //   {
  //     id: "actions",
  //     header: "ACTION",
  //     cell: ({ row }) => <ActionsCell product={row.original} />,
  //   },
];
