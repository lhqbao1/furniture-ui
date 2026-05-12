"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ProductItem } from "@/types/products";
import { useLocale } from "next-intl";
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
import { Check, X } from "lucide-react";
import { stripHtmlRegex } from "@/hooks/simplifyHtml";
import { formatIncomingStockEntry } from "@/lib/format-incoming-stock";

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
  const isBundleProduct =
    product.is_bundle === true || (product.bundles?.length ?? 0) > 0;

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

  if (isBundleProduct) {
    return (
      <div
        className="text-center text-muted-foreground"
        title="Bundle stock is derived from its components"
      >
        {product.stock}
      </div>
    );
  }

  return (
    <div>
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

function ReservedStockCell({ product }: { product: ProductItem }) {
  const locale = useLocale();

  const reservedValue = product.result_stock ?? 0;

  return (
    <div className="text-center">
      <button
        type="button"
        className="text-center cursor-pointer"
        onClick={() => {
          const params = new URLSearchParams({
            search: product.id_provider ?? "",
            status: RESERVED_ORDER_STATUS_FILTER,
            page: "1",
          });
          window.open(
            `/${locale}/admin/orders/list?${params.toString()}`,
            "_blank",
            "noopener,noreferrer",
          );
        }}
      >
        {reservedValue}
      </button>
    </div>
  );
}

const toNumber = (value: unknown): number =>
  typeof value === "number" ? value : Number(value) || 0;

const RESERVED_ORDER_STATUS_FILTER = [
  "tock_reserved", // Stock reserved
  "paid", // Payment received
  "preparation_shipping", // Preparing
].join(",");

const PH_MARKETPLACE_GROUPS = [
  {
    id: "ebay",
    label: "ebay",
    prefix: "EBAY",
    aliases: ["ebay"],
    groupHeaderClassName: "bg-[#E7F0FF] text-[#0B57D0]",
    childHeaderClassName: "bg-[#F4F8FF] text-[#0B57D0]",
    indicatorClassName: "text-[#0B57D0]",
  },
  {
    id: "amazon",
    label: "amazon",
    prefix: "AMAZON",
    aliases: ["amazon", "amz"],
    groupHeaderClassName: "bg-[#FFF1D6] text-[#B45309]",
    childHeaderClassName: "bg-[#FFF8EB] text-[#B45309]",
    indicatorClassName: "text-[#B45309]",
  },
  {
    id: "kaufland",
    label: "kaufland",
    prefix: "KAUFLAND",
    aliases: ["kaufland", "kaufaldn"],
    groupHeaderClassName: "bg-[#FDE5E7] text-[#B42318]",
    childHeaderClassName: "bg-[#FFF1F3] text-[#B42318]",
    indicatorClassName: "text-[#B42318]",
  },
] as const;

const PH_MARKETPLACE_FIELDS = [
  {
    id: "sup_photos_ready",
    labelSuffix: "SUP Photos Ready",
    keys: [
      "sup_photos_ready",
      "sup_photo_ready",
      "support_photos_ready",
      "support_photo_ready",
    ],
    format: "boolean",
  },
  {
    id: "size_photo_ready",
    labelSuffix: "Size Photo Ready",
    keys: ["size_photo_ready", "size_photos_ready", "photo_size_ready"],
    format: "boolean",
  },
  {
    id: "text_information_correct",
    labelSuffix: "Text Information Correct",
    keys: [
      "text_information_correct",
      "text_info_correct",
      "text_information",
    ],
    format: "boolean",
  },
  {
    id: "video_available",
    labelSuffix: "Video Available?",
    keys: ["video_available", "has_video", "video"],
    format: "boolean",
  },
  // {
  //   id: "instructional_manual_available",
  //   labelSuffix: "Instructional Manual Available?",
  //   keys: [
  //     "instructional_manual_available",
  //     "instruction_manual_available",
  //     "manual_available",
  //     "instructional_manual",
  //   ],
  //   format: "boolean",
  // },
  {
    id: "synchrone",
    labelSuffix: "Synchrone?",
    keys: ["is_active"],
    format: "boolean",
  },
  {
    id: "retail_price",
    labelSuffix: "Retail Price",
    keys: ["retail_price", "final_price"],
    format: "currency",
  },
  {
    id: "available_quantity",
    labelSuffix: "Last Sync Quantity",
    keys: ["available_quantity", "current_stock", "max_stock"],
    format: "default",
  },
] as const;

const formatMarketplaceFieldValue = (
  value: unknown,
  format: (typeof PH_MARKETPLACE_FIELDS)[number]["format"],
) => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string" && !value.trim()) return undefined;

  if (format === "boolean") {
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true") return "Yes";
      if (normalized === "false") return "No";
    }
  }

  if (format === "currency") {
    const numericValue =
      typeof value === "number" ? value : Number(String(value).replace(",", "."));

    if (!Number.isNaN(numericValue)) {
      return `€${numericValue.toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
  }

  return String(value);
};

const parseBooleanLike = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }

  return undefined;
};

const renderBooleanIndicator = (
  value: boolean | undefined,
  trueClassName = "text-primary",
) => {
  return value ? (
    <Check
      className={cn("mx-auto h-6 w-6 stroke-[3]", trueClassName)}
    />
  ) : (
    <X className="mx-auto h-6 w-6 text-red-600 stroke-[3]" />
  );
};

const getMarketplaceProductRecord = (
  product: ProductItem,
  aliases: readonly string[],
) =>
  product.marketplace_products?.find((item) =>
    aliases.includes(String(item.marketplace ?? "").toLowerCase()),
  );

const hasProductStaticFiles = (product: ProductItem, minimumCount = 1) =>
  (product.static_files?.length ?? 0) >= minimumCount;

const hasProductVideos = (product: ProductItem) =>
  (product.video_urls ?? []).some((item) => {
    if (typeof item?.url === "string") {
      return item.url.trim().length > 0;
    }

    if (Array.isArray(item?.url)) {
      return item.url.some((url) => String(url ?? "").trim().length > 0);
    }

    return false;
  });

const hasSeoHtmlStructure = (html: string) => {
  const normalized = html.toLowerCase();
  const semanticTags = [
    /<p\b[^>]*>/,
    /<h[2-4]\b[^>]*>/,
    /<ul\b[^>]*>/,
    /<ol\b[^>]*>/,
    /<li\b[^>]*>/,
    /<strong\b[^>]*>/,
    /<br\s*\/?>/,
  ];

  const matchedTagCount = semanticTags.filter((pattern) =>
    pattern.test(normalized),
  ).length;
  const hasBlockContent =
    /<p\b[^>]*>/.test(normalized) ||
    /<h[2-4]\b[^>]*>/.test(normalized) ||
    /<ul\b[^>]*>/.test(normalized) ||
    /<ol\b[^>]*>/.test(normalized);

  return matchedTagCount >= 2 && hasBlockContent;
};

const containsObviousEnglish = (html: string) => {
  const plainText = stripHtmlRegex(html).toLowerCase();

  if (!plainText) return false;

  const englishMarkers = [
    " the ",
    " and ",
    " with ",
    " for ",
    " from ",
    " available ",
    " ready ",
    " video ",
    " manual ",
    " instruction ",
    " size ",
    " photo ",
    " photos ",
    " retail ",
    " quantity ",
    " commission ",
    " shipping ",
    " delivery ",
    " foldable ",
    " outdoor ",
    " indoor ",
    " garden ",
    " chair ",
    " table ",
    " brown ",
    " black ",
    " white ",
  ];

  const paddedText = ` ${plainText.replace(/\s+/g, " ")} `;
  const matchedMarkers = englishMarkers.filter((marker) =>
    paddedText.includes(marker),
  );

  return matchedMarkers.length >= 2;
};

type MarketplaceTextInformationStatus =
  | { status: "no-description" }
  | { status: "ok" }
  | { status: "invalid"; failedRules: Array<"html" | "english"> };

const getMarketplaceTextInformationStatus = (
  product: ProductItem,
  aliases: readonly string[],
): MarketplaceTextInformationStatus => {
  const marketplaceRecord = getMarketplaceProductRecord(product, aliases);
  const description =
    marketplaceRecord?.description?.trim() ?? product.description?.trim() ?? "";
  if (!description) {
    return { status: "no-description" };
  }

  const failedRules: Array<"html" | "english"> = [];

  if (!hasSeoHtmlStructure(description)) {
    failedRules.push("html");
  }

  if (containsObviousEnglish(description)) {
    failedRules.push("english");
  }

  if (failedRules.length > 0) {
    return { status: "invalid", failedRules };
  }

  return { status: "ok" };
};

const getMarketplaceFieldValue = (
  product: ProductItem,
  aliases: readonly string[],
  keys: readonly string[],
  format: (typeof PH_MARKETPLACE_FIELDS)[number]["format"],
) => {
  const marketplaceProduct = getMarketplaceProductRecord(product, aliases);

  if (!marketplaceProduct) return undefined;

  const marketplaceRecord = marketplaceProduct as Record<string, unknown>;

  for (const key of keys) {
    const value = marketplaceRecord[key];
    if (value !== null && value !== undefined && value !== "") {
      return formatMarketplaceFieldValue(value, format);
    }
  }

  return undefined;
};

const getMarketplaceBooleanFieldValue = (
  product: ProductItem,
  aliases: readonly string[],
  keys: readonly string[],
) => {
  const marketplaceProduct = getMarketplaceProductRecord(product, aliases);

  if (!marketplaceProduct) return undefined;

  const marketplaceRecord = marketplaceProduct as Record<string, unknown>;

  for (const key of keys) {
    const parsedValue = parseBooleanLike(marketplaceRecord[key]);
    if (parsedValue !== undefined) {
      return parsedValue;
    }
  }

  return undefined;
};

const calculateBundlePhysicalStock = (product: ProductItem): number => {
  // const bundles = product.bundles ?? [];
  // if (bundles.length === 0) return Math.max(0, toNumber(product.stock));

  // const bundleStocks = bundles
  //   .map((bundle) => {
  //     const qty = toNumber(bundle.quantity);
  //     if (qty <= 0) return Number.NaN;

  //     const childPhysicalStock = Math.max(0, toNumber(bundle.bundle_item?.stock));
  //     const ratio = childPhysicalStock / qty;
  //     return ratio >= 0 ? Math.floor(ratio) : Math.ceil(ratio);
  //   })
  //   .filter((value) => !Number.isNaN(value));

  // if (bundleStocks.length > 0) {
  //   return Math.max(0, Math.min(...bundleStocks));
  // }

  // return Math.max(0, toNumber(product.stock));
  return toNumber(product.stock);
};

const calculateBundleReservedStock = (product: ProductItem): number => {
  return toNumber(product.result_stock);
};

export const getInventoryColumns = (
  setSortByStock: (val?: "asc" | "desc") => void,
  options: {
    is_incoming?: boolean;
    variant?: "default" | "ph";
  } = {},
): ColumnDef<ProductItem>[] => {
  const isPhVariant = options.variant === "ph";
  const columns: ColumnDef<ProductItem>[] = [
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
        <div className="mt-2 flex flex-col gap-1.5 items-start text-sm">
          <div>
            <span className="font-semibold text-secondary">SKU:</span>{" "}
            <span>{row.original.sku || "—"}</span>
          </div>
          {isPhVariant ? (
            <div>
              <span className="font-semibold text-sky-700">EAN:</span>{" "}
              <span>{row.original.ean || "—"}</span>
            </div>
          ) : null}
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
      const isBundle =
        row.original.is_bundle ||
        (row.original.bundles && row.original.bundles.length > 0);
      const reserved = isBundle
        ? calculateBundleReservedStock(row.original)
        : toNumber(row.original.result_stock);
      const physical = isBundle
        ? calculateBundlePhysicalStock(row.original)
        : toNumber(row.original.stock);

      const available = physical - Math.abs(reserved);
      return <div className="text-center">{available}</div>;
    },
    },

    {
    accessorKey: "reserved",
    header: ({}) => <div className="text-center uppercase">Reserved</div>,
    cell: ({ row }) => {
      return <ReservedStockCell product={row.original} />;
    },
    },

    {
    accessorKey: "physical",
    header: ({}) => <div className="text-center uppercase">Physical</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.original.is_bundle ||
          (row.original.bundles && row.original.bundles.length > 0) ? (
            calculateBundlePhysicalStock(row.original)
          ) : (
            <EditableStockCell product={row.original} />
          )}
        </div>
      );
    },
    },
    {
    id: "incoming_stock",
    header: () => <div className="text-center uppercase">incoming</div>,
    cell: ({ row }) => {
      const inventoryPos = row.original.inventory_pos ?? [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcoming = inventoryPos.filter((item) => {
        if (!item.list_delivery_date) return false;
        const date = new Date(item.list_delivery_date);
        if (Number.isNaN(date.getTime())) return false;
        date.setHours(0, 0, 0, 0);
        return date > today;
      });

      if (!upcoming.length) {
        return <div className="text-center">—</div>;
      }

      return (
        <div className="space-y-1.5 text-sm text-center">
          {upcoming.map((item) => {
            const date = item.list_delivery_date
              ? new Date(item.list_delivery_date)
              : null;

            const sixWeeksFromNow = new Date(today);
            sixWeeksFromNow.setDate(sixWeeksFromNow.getDate() + 42);
            const isSoon =
              date &&
              !Number.isNaN(date.getTime()) &&
              date > today &&
              date <= sixWeeksFromNow;

            return (
              <div
                key={item.id}
                className={isSoon ? "text-secondary" : undefined}
              >
                {formatIncomingStockEntry(item.quantity, date)}
              </div>
            );
          })}
        </div>
      );
    },
    },

    {
    accessorKey: "available_purchase_value",
    header: ({}) => (
      <div className="text-center uppercase">Available Value</div>
    ),
    cell: ({ row }) => {
      const isBundle =
        row.original.is_bundle ||
        (row.original.bundles && row.original.bundles.length > 0);
      const reserved = isBundle
        ? calculateBundleReservedStock(row.original)
        : toNumber(row.original.result_stock);
      const physical = isBundle
        ? calculateBundlePhysicalStock(row.original)
        : toNumber(row.original.stock);
      const available = Math.max(0, physical - Math.abs(reserved));
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
    header: ({}) => <div className="text-center uppercase">Reserved Value</div>,
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
    header: ({}) => <div className="text-center uppercase">Physical Value</div>,
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
      const isBundle =
        row.original.is_bundle ||
        (row.original.bundles && row.original.bundles.length > 0);
      const reserved = isBundle
        ? calculateBundleReservedStock(row.original)
        : toNumber(row.original.result_stock);
      const physical = isBundle
        ? calculateBundlePhysicalStock(row.original)
        : toNumber(row.original.stock);
      const available = Math.max(0, physical - Math.abs(reserved));

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

  if (isPhVariant) {
    columns.push(
      ...PH_MARKETPLACE_GROUPS.map(
        (marketplaceGroup): ColumnDef<ProductItem> => ({
          id: marketplaceGroup.id,
          meta: { headerClassName: marketplaceGroup.groupHeaderClassName },
          header: () => (
            <div className="text-center font-semibold lowercase">
              {marketplaceGroup.label}
            </div>
          ),
          columns: PH_MARKETPLACE_FIELDS.map(
            (field): ColumnDef<ProductItem> => ({
              id: `${marketplaceGroup.id}_${field.id}`,
              meta: {
                width: 140,
                headerClassName: marketplaceGroup.childHeaderClassName,
              },
              header: () => (
                <div className="text-center text-[11px] font-semibold uppercase leading-tight whitespace-normal">
                  {marketplaceGroup.prefix} {field.labelSuffix}
                </div>
              ),
              cell: ({ row }) => {
                if (field.id === "sup_photos_ready") {
                  const hasEnoughPhotos = hasProductStaticFiles(
                    row.original,
                    3,
                  );

                  return (
                    <div className="text-center text-sm">
                      {renderBooleanIndicator(
                        hasEnoughPhotos,
                        marketplaceGroup.indicatorClassName,
                      )}
                    </div>
                  );
                }

                if (field.id === "size_photo_ready") {
                  const hasMarketplaceSizePhotoFlag =
                    getMarketplaceBooleanFieldValue(
                      row.original,
                      marketplaceGroup.aliases,
                      field.keys,
                    ) ?? false;
                  const hasSizePhotoData =
                    hasMarketplaceSizePhotoFlag || hasProductStaticFiles(row.original);

                  return (
                    <div className="text-center text-sm">
                      {renderBooleanIndicator(
                        hasSizePhotoData,
                        marketplaceGroup.indicatorClassName,
                      )}
                    </div>
                  );
                }

                if (field.id === "text_information_correct") {
                  const textInformationStatus =
                    getMarketplaceTextInformationStatus(
                      row.original,
                      marketplaceGroup.aliases,
                    );

                  if (textInformationStatus.status === "ok") {
                    return (
                      <div className="text-center text-sm">
                        {renderBooleanIndicator(
                          true,
                          marketplaceGroup.indicatorClassName,
                        )}
                      </div>
                    );
                  }

                  if (textInformationStatus.status === "no-description") {
                    return (
                      <div className="text-center text-sm font-semibold leading-tight text-red-600">
                        No description
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col items-center justify-center gap-1 text-sm font-semibold leading-tight text-red-600">
                      {textInformationStatus.failedRules.map((rule) => (
                        <div key={rule} className="text-center">
                          <span>
                            {rule === "html"
                              ? "Missing HTML"
                              : "Contains English"}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }

                if (field.id === "video_available") {
                  const hasMarketplaceVideoFlag = getMarketplaceBooleanFieldValue(
                    row.original,
                    marketplaceGroup.aliases,
                    field.keys,
                  );
                  const hasVideoData =
                    hasMarketplaceVideoFlag === true || hasProductVideos(row.original);

                  return (
                    <div className="text-center text-sm">
                      {renderBooleanIndicator(
                        hasVideoData,
                        marketplaceGroup.indicatorClassName,
                      )}
                    </div>
                  );
                }

                if (field.id === "synchrone") {
                  const synchroneValue = getMarketplaceBooleanFieldValue(
                    row.original,
                    marketplaceGroup.aliases,
                    field.keys,
                  );

                  return (
                    <div className="text-center text-sm">
                      {renderBooleanIndicator(
                        synchroneValue ?? false,
                        marketplaceGroup.indicatorClassName,
                      )}
                    </div>
                  );
                }

                if (field.format === "boolean") {
                  return (
                    <div className="text-center text-sm">
                      {renderBooleanIndicator(
                        getMarketplaceBooleanFieldValue(
                          row.original,
                          marketplaceGroup.aliases,
                          field.keys,
                        ),
                        marketplaceGroup.indicatorClassName,
                      )}
                    </div>
                  );
                }

                return (
                  <div className="text-center text-sm">
                    {(() => {
                      const value = getMarketplaceFieldValue(
                        row.original,
                        marketplaceGroup.aliases,
                        field.keys,
                        field.format,
                      );

                      return value === undefined
                        ? renderBooleanIndicator(false)
                        : value;
                    })()}
                  </div>
                );
              },
            }),
          ),
        }),
      ),
    );
  }

  if (options.variant !== "ph") {
    return columns;
  }

  const hiddenColumnKeys = new Set([
    "ean",
    "supplier",
    "purchase_cost",
    "price",
    "available_purchase_value",
    "reserved_purchase_value",
    "physical_purchase_value",
    "available_sale_value",
  ]);

  return columns
    .filter((column) => {
    const columnKey =
      "accessorKey" in column
        ? typeof column.accessorKey === "string"
          ? column.accessorKey
          : undefined
        : column.id;

    return columnKey ? !hiddenColumnKeys.has(columnKey) : true;
    })
    .map((column) => {
      const columnKey =
        "accessorKey" in column
          ? typeof column.accessorKey === "string"
            ? column.accessorKey
            : undefined
          : column.id;

      const currentMeta = (column.meta as Record<string, unknown> | undefined) ?? {};

      if (columnKey === "static_files") {
        return {
          ...column,
          meta: {
            ...currentMeta,
            width: 88,
            stickyLeft: 0,
            stickyClassName: "shadow-[2px_0_6px_-3px_rgba(15,23,42,0.18)]",
          },
        };
      }

      if (columnKey === "id") {
        return {
          ...column,
          meta: {
            ...currentMeta,
            width: 110,
            stickyLeft: 88,
            stickyClassName: "shadow-[2px_0_6px_-3px_rgba(15,23,42,0.18)]",
          },
        };
      }

      if (columnKey === "name") {
        return {
          ...column,
          meta: {
            ...currentMeta,
            width: 360,
            stickyLeft: 198,
            stickyClassName: "shadow-[6px_0_8px_-6px_rgba(15,23,42,0.22)]",
          },
        };
      }

      return column;
    });
};
