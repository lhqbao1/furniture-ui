"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CopyCheck, Eye, Pencil } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductItem } from "@/types/products";
import { useState } from "react";
import { useEditProduct } from "@/features/products/hook";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import DeleteDialog from "./delete-dialog";
import { useLocale } from "next-intl";
import { Link, useRouter } from "@/src/i18n/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { getProductById } from "@/features/products/api";
import { useGetSuppliers } from "@/features/supplier/hook";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { getCarrierLogo } from "@/lib/getCarrierImage";

function EditableNameCell({ product }: { product: ProductItem }) {
  const [value, setValue] = useState(product.name);
  const [editing, setEditing] = useState(false);
  const EditProductMutation = useEditProduct();

  const handleEditProductName = () => {
    EditProductMutation.mutate(
      {
        input: {
          ...product,
          name: value,
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
        },
        id: product.id,
      },
      {
        onSuccess(data, variables, context) {
          toast.success("Update product name successful");
          setEditing(false);
        },
        onError(error, variables, context) {
          toast.error("Update product name fail");
        },
      },
    );
  };

  return (
    <div className="w-60 text-wrap">
      {editing ? (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            if (value !== product.name) {
            } else {
              setEditing(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleEditProductName();
            }
            if (e.key === "Escape") {
              setValue(product.name);
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
          className="cursor-pointer"
          onClick={() => setEditing(true)}
        >
          {product.name}
        </div>
      )}
    </div>
  );
}

function EditableStockCell({ product }: { product: ProductItem }) {
  const [value, setValue] = useState(product.stock);
  const [editing, setEditing] = useState(false);
  const EditProductMutation = useEditProduct();

  const handleEditProductStock = () => {
    EditProductMutation.mutate(
      {
        input: {
          ...product,
          stock: value,
          ...(product.categories?.length
            ? { category_ids: product.categories.map((c) => c.id) }
            : {}),
          ...(product.brand?.id ? { brand_id: product.brand.id } : {}),
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
          onChange={(e) => setValue(e.target.valueAsNumber)}
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
          className="cursor-pointer"
          onClick={() => setEditing(true)}
        >
          {product.stock} pcs.
        </div>
      )}
    </div>
  );
}

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
    <div className="flex justify-center">
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
            <div className="text-center">—</div>
          )}
        </div>
      )}
    </div>
  );
}

function EditTableSupplierCell({ product }: { product: ProductItem }) {
  const [value, setValue] = useState("");
  const [editing, setEditing] = useState(false);
  const EditProductMutation = useEditProduct();

  const { data: suppliers, isLoading, isError } = useGetSuppliers();

  const handleEditSupplier = (owner_id: string) => {
    EditProductMutation.mutate(
      {
        input: {
          ...product,
          owner_id: owner_id,
          ...(product.categories?.length
            ? { category_ids: product.categories.map((c) => c.id) }
            : {}),
          ...(product.brand?.id ? { brand_id: product.brand.id } : {}),
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
        onSuccess() {
          toast.success("Supplier updated successfully");
          setEditing(false);
        },
        onError() {
          toast.error("Update failed");
        },
      },
    );
  };

  return (
    <div className="flex justify-center text-center w-full">
      {editing ? (
        <Select
          value={value.toString()}
          onValueChange={(val) => {
            setValue(val);
            handleEditSupplier(val); // gọi mutation ngay khi chọn xong
          }}
          disabled={EditProductMutation.isPending || isLoading}
        >
          <SelectTrigger
            placeholderColor
            className={cn(
              "w-36 border",
              EditProductMutation.isPending && "cursor-wait",
            )}
          >
            {/* <SelectValue
              placeholder={isLoading ? "Loading..." : "Select supplier"}
            /> */}
          </SelectTrigger>
          <SelectContent className="border">
            {suppliers?.map((s) => (
              <SelectItem
                key={s.id}
                value={s.id.toString()}
              >
                {s.business_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div
          className="cursor-pointer"
          onClick={() => setEditing(true)}
        >
          {product.owner ? product.owner.business_name : "Prestige Home"}
        </div>
      )}
    </div>
  );
}

function ToggleProductStatus({ product }: { product: ProductItem }) {
  const editProductMutation = useEditProduct();
  const hasMarketplace =
    product.marketplace_products?.some((item) => item.is_active === true) ??
    false;

  const isIncomplete =
    product.static_files.length === 0 ||
    !product.name ||
    !product.final_price ||
    !product.brand ||
    !product.delivery_time ||
    !product.carrier ||
    product.categories.length === 0;

  const handleToggleStatus = () => {
    if (isIncomplete && product.is_active === false) {
      toast.error("Product information is incomplete");
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

function ActionsCell({ product }: { product: ProductItem }) {
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();

  const categories = product.categories || [];
  const formatName = (name: string) =>
    name.trim().toLowerCase().replace(/\s+/g, "-");

  const level1 = categories.find((c) => c.level === 1);
  const level2 = categories.find((c) => c.level === 2);

  const handleClick = async (
    e: React.MouseEvent<HTMLButtonElement>,
    id: string,
  ) => {
    const url = `/${locale}/admin/products/${id}/edit`;

    // 🧭 Nếu user giữ Ctrl / Cmd / middle click → chỉ mở tab mới
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      // Prefetch trước cho tab mới load nhanh hơn (optional)
      queryClient.prefetchQuery({
        queryKey: ["product", id],
        queryFn: () => getProductById(id),
      });
      router.prefetch(`/admin/products/${id}/edit`);

      // 🚀 Mở tab mới, KHÔNG ảnh hưởng tab hiện tại
      window.open(url, "_blank", "noopener,noreferrer");
      return; // 🧠 Dừng ở đây — không router.push nữa
    }

    // 🟢 Click bình thường → đi trong tab hiện tại
    try {
      await queryClient.prefetchQuery({
        queryKey: ["product", id],
        queryFn: () => getProductById(id),
      });
      router.prefetch(`/admin/products/${id}/edit`);
      router.push(`/admin/products/${id}/edit`, { locale });
    } catch (err) {
      console.error("Prefetch failed:", err);
      router.push(`/admin/products/${id}/edit`, { locale });
    }
  };

  return (
    <div className="flex gap-2">
      {/* <Link href={`/admin/products/${product.id}/edit`}> */}
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => handleClick(e, product.id)}
        title="Edit Product"
      >
        <Pencil className="w-4 h-4 text-primary" />
      </Button>

      {/* </Link> */}
      {/* <DeleteDialog
        product={product}
        isEbay={
          product.marketplace_products.find((i) => i.marketplace === "ebay")
            ?.is_active
            ? true
            : false
        }
      /> */}
      <Link
        href={`/product/${product.url_key}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          variant="ghost"
          size="icon"
        >
          <Eye className="w-4 h-4 text-secondary" />
        </Button>
      </Link>
      <Link
        href={`/admin/products/${product.id}/clone`}
        prefetch={true}
      >
        <Button
          variant="ghost"
          size="icon"
        >
          <CopyCheck className="w-4 h-4 text-secondary" />
        </Button>
      </Link>
    </div>
  );
}

export const getProductColumns = (
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
    accessorKey: "id",
    header: ({}) => <div className="text-center">ID</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.original.id_provider}</div>;
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
  {
    accessorKey: "owner",
    header: ({}) => <div className="text-center">SUPPLIER</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          <EditTableSupplierCell product={row.original} />
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => <div className="text-center">CATEGORY</div>,
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-1 items-center">
          {row.original.categories.length > 0 ? (
            row.original.categories.map((item, indx) => {
              return <div key={item.id}>{item.name}</div>;
            })
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
    accessorKey: "is_active",
    header: "STATUS",
    cell: ({ row }) => (
      // <span
      //     className={`px-2 py-1 rounded-md text-xs ${row.original.is_active ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
      //         }`}
      // >
      //     {row.original.is_active ? "active" : "inactive"}
      // </span>
      <ToggleProductStatus product={row.original} />
    ),
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
    accessorKey: "shipping_cost",
    header: () => <div className="text-center">DELIVERY COST</div>,
    cell: ({ row }) => (
      <>
        {row.original.delivery_cost ? (
          <div className="text-right">
            €{row.original.delivery_cost?.toFixed(2)}
          </div>
        ) : (
          <div className="text-center">—</div>
        )}
      </>
    ),
  },
  {
    accessorKey: "final_price",
    header: () => <div className="text-center">FINAL PRICE</div>,
    cell: ({ row }) => <EdittbalePriceCell product={row.original} />,
  },
  {
    id: "margin",
    header: () => <div className="text-center">MARGIN</div>,
    cell: ({ row }) => {
      const { final_price, cost, tax } = row.original;
      const taxRate = parseFloat(tax) / 100;
      if (!final_price || !cost || final_price <= 0)
        return <div className="text-center">—</div>;

      const margin = (1 / (1 + taxRate) - cost / final_price) * 100;
      return <div className="text-right">{margin.toFixed(1)}%</div>;
    },
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
    id: "actions",
    header: "ACTION",
    cell: ({ row }) => <ActionsCell product={row.original} />,
  },
];
