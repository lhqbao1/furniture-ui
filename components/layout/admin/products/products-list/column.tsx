"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CopyCheck, Eye, Loader2, Pencil } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductItem } from "@/types/products";
import { useEffect, useMemo, useState } from "react";
import { useEditProduct } from "@/features/products/hook";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useLocale } from "next-intl";
import { Link, useRouter } from "@/src/i18n/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { getProductById } from "@/features/products/api";
import { useGetSuppliers } from "@/features/supplier/hook";
import { useGetBrands } from "@/features/brand/hook";
import { useGetCategories } from "@/features/category/hook";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { getCarrierLogo } from "@/lib/getCarrierImage";
import { CategoryResponse } from "@/types/categories";
import { CARRIERS } from "@/data/data";
import EditProductDrawer from "../marketplace/edit-product-drawer";

const PRESTIGE_OWNER_VALUE = "__PRESTIGE__";

type FlattenCategory = CategoryResponse & {
  isParent: boolean;
  depth: number;
};

const flattenCategories = (
  categories: CategoryResponse[],
  depth = 0,
): FlattenCategory[] => {
  let result: FlattenCategory[] = [];

  for (const category of categories) {
    const hasChildren = !!(category.children && category.children.length > 0);

    result.push({
      ...category,
      isParent: hasChildren,
      depth,
    });

    if (hasChildren) {
      result = [...result, ...flattenCategories(category.children!, depth + 1)];
    }
  }

  return result;
};

const sortByHasValue = (rowA: any, rowB: any, columnId: string): number => {
  const a = rowA.getValue(columnId);
  const b = rowB.getValue(columnId);
  const aHasValue = a !== null && a !== undefined && String(a).trim() !== "";
  const bHasValue = b !== null && b !== undefined && String(b).trim() !== "";

  if (aHasValue === bHasValue) return 0;
  return aHasValue ? 1 : -1;
};

const getErrorDescription = (error: any) => {
  const detail =
    error?.response?.data?.detail ??
    error?.response?.data?.message ??
    error?.message ??
    "";

  if (typeof detail === "string" && detail.trim().length > 0) {
    const lower = detail.toLowerCase();
    if (lower.includes("duplicate") || lower.includes("unique")) {
      const keyMatch = detail.match(/Key\s+\(([^)]+)\)=\(([^)]+)\)/i);
      if (keyMatch?.[1]) {
        const field = keyMatch[1].toUpperCase();
        const value = keyMatch[2];
        return `Duplication in ${field}${value ? ` (${value})` : ""}`;
      }

      const constraintMatch = detail.match(/products_([a-z0-9_]+)_key/i);
      if (constraintMatch?.[1]) {
        const field = constraintMatch[1].toUpperCase();
        return `Duplication in ${field}`;
      }
    }

    return detail;
  }

  if (Array.isArray(detail?.errors) && detail.errors.length > 0) {
    return (
      detail.errors[0]?.message ??
      detail.errors[0]?.detail ??
      "Please try again."
    );
  }

  return "Please try again.";
};

function EditableNameCell({ product }: { product: ProductItem }) {
  const [value, setValue] = useState(product.name);
  const [editing, setEditing] = useState(false);
  const EditProductMutation = useEditProduct();

  const handleEditProductName = () => {
    const toastId = toast.loading("Updating product name...");
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
          brand_id: product.brand ? product.brand.id : null,
        },
        id: product.id,
      },
      {
        onSuccess() {
          toast.success("Update product name successful", { id: toastId });
          setEditing(false);
        },
        onError(error) {
          toast.error("Update product name fail", {
            id: toastId,
            description: getErrorDescription(error),
          });
        },
      },
    );
  };

  return (
    <div className="text-wrap">
      {editing ? (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            setValue(product.name);
            setEditing(false);
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
          className="cursor-pointer text-wrap"
          onClick={() => setEditing(true)}
        >
          {product.name}
        </div>
      )}
    </div>
  );
}

function EditableSkuCell({ product }: { product: ProductItem }) {
  const [value, setValue] = useState(product.sku ?? "");
  const [editing, setEditing] = useState(false);
  const EditProductMutation = useEditProduct();

  const handleEditProductSku = () => {
    const toastId = toast.loading("Updating product SKU...");
    EditProductMutation.mutate(
      {
        input: {
          ...product,
          sku: value,
          category_ids: product.categories.map((c) => c.id),
          ...(product.brand?.id ? { brand_id: product.brand.id } : {}),
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
        onSuccess() {
          toast.success("Update product SKU successful", { id: toastId });
          setEditing(false);
        },
        onError(error) {
          toast.error("Update product SKU fail", {
            id: toastId,
            description: getErrorDescription(error),
          });
        },
      },
    );
  };

  return (
    <div className="">
      {editing ? (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            setValue(product.sku ?? "");
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleEditProductSku();
            }
            if (e.key === "Escape") {
              setValue(product.sku ?? "");
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
          className="cursor-pointer text-center"
          onClick={() => setEditing(true)}
        >
          {product.sku || "—"}
        </div>
      )}
    </div>
  );
}

function EditableEanCell({ product }: { product: ProductItem }) {
  const [value, setValue] = useState(product.ean ?? "");
  const [editing, setEditing] = useState(false);
  const EditProductMutation = useEditProduct();

  const handleEditProductEan = () => {
    const toastId = toast.loading("Updating product EAN...");
    const sanitizedEan = value.trim();
    const digitsOnly = sanitizedEan.replace(/\D/g, "");
    if (
      digitsOnly.length > 0 &&
      digitsOnly.length !== 8 &&
      digitsOnly.length !== 13
    ) {
      toast.error("EAN must be 8 or 13 characters", { id: toastId });
      return;
    }
    EditProductMutation.mutate(
      {
        input: {
          ...product,
          ean: digitsOnly.length > 0 ? digitsOnly : null,
          category_ids: product.categories.map((c) => c.id),
          ...(product.brand?.id ? { brand_id: product.brand.id } : {}),
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
        onSuccess() {
          toast.success("Update product EAN successful", { id: toastId });
          setEditing(false);
        },
        onError(error) {
          toast.error("Update product EAN fail", {
            id: toastId,
            description: getErrorDescription(error),
          });
        },
      },
    );
  };

  return (
    <div className="text-wrap">
      {editing ? (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            setValue(product.ean ?? "");
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleEditProductEan();
            }
            if (e.key === "Escape") {
              setValue(product.ean ?? "");
              setEditing(false);
            }
          }}
          autoFocus
          disabled={EditProductMutation.isPending}
          className={cn(
            "w-32",
            EditProductMutation.isPending ? "cursor-wait" : "cursor-text",
          )}
        />
      ) : (
        <div
          className="cursor-pointer text-wrap text-center"
          onClick={() => setEditing(true)}
        >
          {product.ean || "—"}
        </div>
      )}
    </div>
  );
}

function EditableColorCell({ product }: { product: ProductItem }) {
  const [value, setValue] = useState(product.color ?? "");
  const [editing, setEditing] = useState(false);
  const EditProductMutation = useEditProduct();

  const handleEditProductColor = () => {
    const toastId = toast.loading("Updating product color...");
    const sanitizedColor = value.trim();
    EditProductMutation.mutate(
      {
        input: {
          ...product,
          color: sanitizedColor.length > 0 ? sanitizedColor : null,
          category_ids: product.categories.map((c) => c.id),
          ...(product.brand?.id ? { brand_id: product.brand.id } : {}),
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
        onSuccess() {
          toast.success("Update product color successful", { id: toastId });
          setEditing(false);
        },
        onError(error) {
          toast.error("Update product color fail", {
            id: toastId,
            description: getErrorDescription(error),
          });
        },
      },
    );
  };

  return (
    <div className="text-wrap">
      {editing ? (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            setValue(product.color ?? "");
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleEditProductColor();
            }
            if (e.key === "Escape") {
              setValue(product.color ?? "");
              setEditing(false);
            }
          }}
          autoFocus
          disabled={EditProductMutation.isPending}
          className={cn(
            "w-32",
            EditProductMutation.isPending ? "cursor-wait" : "cursor-text",
          )}
        />
      ) : (
        <div
          className="cursor-pointer text-wrap text-center"
          onClick={() => setEditing(true)}
        >
          {product.color || "—"}
        </div>
      )}
    </div>
  );
}

function EditableMaterialsCell({ product }: { product: ProductItem }) {
  const [value, setValue] = useState(product.materials ?? "");
  const [editing, setEditing] = useState(false);
  const EditProductMutation = useEditProduct();

  const handleEditProductMaterials = () => {
    const toastId = toast.loading("Updating product materials...");
    const sanitizedMaterials = value.trim();
    EditProductMutation.mutate(
      {
        input: {
          ...product,
          materials: sanitizedMaterials.length > 0 ? sanitizedMaterials : null,
          category_ids: product.categories.map((c) => c.id),
          ...(product.brand?.id ? { brand_id: product.brand.id } : {}),
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
        onSuccess() {
          toast.success("Update product materials successful", {
            id: toastId,
          });
          setEditing(false);
        },
        onError(error) {
          toast.error("Update product materials fail", {
            id: toastId,
            description: getErrorDescription(error),
          });
        },
      },
    );
  };

  return (
    <div className="text-wrap">
      {editing ? (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            setValue(product.materials ?? "");
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleEditProductMaterials();
            }
            if (e.key === "Escape") {
              setValue(product.materials ?? "");
              setEditing(false);
            }
          }}
          autoFocus
          disabled={EditProductMutation.isPending}
          className={cn(
            "w-32",
            EditProductMutation.isPending ? "cursor-wait" : "cursor-text",
          )}
        />
      ) : (
        <div
          className="cursor-pointer text-wrap text-center"
          onClick={() => setEditing(true)}
        >
          {product.materials || "—"}
        </div>
      )}
    </div>
  );
}

function EditableComponentCell({ product }: { product: ProductItem }) {
  const [value, setValue] = useState(product.component ?? "");
  const [editing, setEditing] = useState(false);
  const EditProductMutation = useEditProduct();

  const handleEditProductComponent = () => {
    const toastId = toast.loading("Updating product component...");
    const sanitizedComponent = value.trim();
    EditProductMutation.mutate(
      {
        input: {
          ...product,
          component:
            sanitizedComponent.length > 0 ? sanitizedComponent : "null",
          category_ids: product.categories.map((c) => c.id),
          ...(product.brand?.id ? { brand_id: product.brand.id } : {}),
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
        onSuccess() {
          toast.success("Update product component successful", {
            id: toastId,
          });
          setEditing(false);
        },
        onError(error) {
          toast.error("Update product component fail", {
            id: toastId,
            description: getErrorDescription(error),
          });
        },
      },
    );
  };

  return (
    <div className="text-wrap">
      {editing ? (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            setValue(product.component ?? "");
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleEditProductComponent();
            }
            if (e.key === "Escape") {
              setValue(product.component ?? "");
              setEditing(false);
            }
          }}
          autoFocus
          disabled={EditProductMutation.isPending}
          className={cn(
            "w-32",
            EditProductMutation.isPending ? "cursor-wait" : "cursor-text",
          )}
        />
      ) : (
        <div
          className="cursor-pointer text-wrap text-center"
          onClick={() => setEditing(true)}
        >
          {product.component || "—"}
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
    const toastId = toast.loading("Updating product price...");
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
        onSuccess() {
          toast.success("Update product price successful", { id: toastId });
          setEditing(false);
        },
        onError(error) {
          toast.error("Update product price fail", {
            id: toastId,
            description: getErrorDescription(error),
          });
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
            setValue(product.final_price);
            setEditing(false);
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
        <div className="cursor-pointer" onClick={() => setEditing(true)}>
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

function EditableCostCell({ product }: { product: ProductItem }) {
  const [value, setValue] = useState(product.cost);
  const [editing, setEditing] = useState(false);
  const EditProductMutation = useEditProduct();

  const handleEditProductCost = () => {
    const toastId = toast.loading("Updating product cost...");
    EditProductMutation.mutate(
      {
        input: {
          ...product,
          cost: value,
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
          brand_id: product.brand ? product.brand.id : null,
        },
        id: product.id,
      },
      {
        onSuccess() {
          toast.success("Update product cost successful", { id: toastId });
          setEditing(false);
        },
        onError(error) {
          toast.error("Update product cost fail", {
            id: toastId,
            description: getErrorDescription(error),
          });
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
            setValue(product.cost);
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleEditProductCost();
            }
            if (e.key === "Escape") {
              setValue(product.cost);
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
        <div className="cursor-pointer" onClick={() => setEditing(true)}>
          {product.cost ? (
            <div className="text-right">€{product.cost?.toFixed(2)}</div>
          ) : (
            <div className="text-center">—</div>
          )}
        </div>
      )}
    </div>
  );
}

function EditableDeliveryCostCell({ product }: { product: ProductItem }) {
  const [value, setValue] = useState(product.delivery_cost);
  const [editing, setEditing] = useState(false);
  const EditProductMutation = useEditProduct();

  const handleEditProductDeliveryCost = () => {
    const toastId = toast.loading("Updating delivery cost...");
    EditProductMutation.mutate(
      {
        input: {
          ...product,
          delivery_cost: value,
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
          brand_id: product.brand ? product.brand.id : null,
        },
        id: product.id,
      },
      {
        onSuccess() {
          toast.success("Update delivery cost successful", { id: toastId });
          setEditing(false);
        },
        onError(error) {
          toast.error("Update delivery cost fail", {
            id: toastId,
            description: getErrorDescription(error),
          });
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
            setValue(product.delivery_cost);
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleEditProductDeliveryCost();
            }
            if (e.key === "Escape") {
              setValue(product.delivery_cost);
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
        <div className="cursor-pointer" onClick={() => setEditing(true)}>
          {product.delivery_cost ? (
            <div className="text-right">
              €{product.delivery_cost?.toFixed(2)}
            </div>
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

  const handleEditSupplier = (ownerValue: string) => {
    const toastId = toast.loading("Updating supplier...");
    const owner_id = ownerValue === PRESTIGE_OWNER_VALUE ? null : ownerValue;

    EditProductMutation.mutate(
      {
        input: {
          ...product,
          owner_id,
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
          brand_id: product.brand ? product.brand.id : null,
        },
        id: product.id,
      },
      {
        onSuccess() {
          toast.success("Supplier updated successfully", { id: toastId });
          setEditing(false);
        },
        onError(error) {
          toast.error("Update failed", {
            id: toastId,
            description: getErrorDescription(error),
          });
        },
      },
    );
  };

  useEffect(() => {
    if (product.owner?.id) {
      setValue(product.owner.id.toString());
    } else {
      setValue(PRESTIGE_OWNER_VALUE);
    }
  }, [product.owner]);

  return (
    <div className="flex justify-center text-center w-full">
      {editing ? (
        <Select
          value={value}
          onOpenChange={(open) => {
            if (!open && !EditProductMutation.isPending) {
              setEditing(false);
            }
          }}
          onValueChange={(val) => {
            setValue(val);
            handleEditSupplier(val);
          }}
          disabled={EditProductMutation.isPending || isLoading}
        >
          <SelectTrigger className="w-36 border">
            <SelectValue placeholder={isLoading ? "Loading..." : ""} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PRESTIGE_OWNER_VALUE}>
              Prestige Home GmbH
            </SelectItem>

            {suppliers?.map((s) => (
              <SelectItem key={s.id} value={s.id.toString()}>
                {s.business_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="cursor-pointer" onClick={() => setEditing(true)}>
          {product.owner ? product.owner.business_name : "Prestige Home"}
        </div>
      )}
    </div>
  );
}

function EditableBrandCell({ product }: { product: ProductItem }) {
  const [value, setValue] = useState(product.brand?.id ?? "");
  const [editing, setEditing] = useState(false);
  const editProductMutation = useEditProduct();
  const { data: brands, isLoading } = useGetBrands();

  useEffect(() => {
    setValue(product.brand?.id ?? "");
  }, [product.brand]);

  const handleEditBrand = (brandId: string) => {
    const toastId = toast.loading("Updating brand...");
    const selectedBrand = brands?.find((brand) => brand.id === brandId);
    const isBrandEconelo = selectedBrand?.name
      ?.toLowerCase()
      .includes("econelo");

    editProductMutation.mutate(
      {
        input: {
          ...product,
          brand_id: brandId || null,
          is_econelo:
            typeof isBrandEconelo === "boolean"
              ? isBrandEconelo
              : product.is_econelo,
          ...(product.categories?.length
            ? { category_ids: product.categories.map((c) => c.id) }
            : {}),
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
          toast.success("Brand updated successfully", { id: toastId });
          setEditing(false);
        },
        onError(error) {
          toast.error("Update brand failed", {
            id: toastId,
            description: getErrorDescription(error),
          });
        },
      },
    );
  };

  return (
    <div className="flex justify-center text-center w-full">
      {editing ? (
        <Select
          value={value}
          onOpenChange={(open) => {
            if (!open && !editProductMutation.isPending) {
              setEditing(false);
            }
          }}
          onValueChange={(val) => {
            setValue(val);
            handleEditBrand(val);
          }}
          disabled={editProductMutation.isPending || isLoading}
        >
          <SelectTrigger className="w-36 border">
            <SelectValue placeholder={isLoading ? "Loading..." : ""} />
          </SelectTrigger>
          <SelectContent>
            {brands?.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="cursor-pointer" onClick={() => setEditing(true)}>
          {product.brand ? product.brand.name : "—"}
        </div>
      )}
    </div>
  );
}

function EditableCategoryCell({ product }: { product: ProductItem }) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    product.categories?.map((category) => category.id) ?? [],
  );
  const editProductMutation = useEditProduct();
  const { data: categories, isLoading, isError } = useGetCategories();

  useEffect(() => {
    setSelectedIds(product.categories?.map((category) => category.id) ?? []);
  }, [product.categories]);

  const flatOptions = useMemo(() => {
    if (!categories) return [];
    return flattenCategories(categories);
  }, [categories]);

  const selectedNames = useMemo(() => {
    if (selectedIds.length === 0) return [];
    const optionMap = new Map(
      flatOptions.map((option) => [option.id, option.name]),
    );
    const fallbackMap = new Map(
      (product.categories ?? []).map((category) => [
        category.id,
        category.name,
      ]),
    );

    return selectedIds
      .map((id) => optionMap.get(id) ?? fallbackMap.get(id))
      .filter(Boolean) as string[];
  }, [flatOptions, product.categories, selectedIds]);

  const handleUpdateCategories = (nextSelected: string[]) => {
    const previous = selectedIds;
    setSelectedIds(nextSelected);

    const toastId = toast.loading("Updating categories...");
    editProductMutation.mutate(
      {
        input: {
          ...product,
          category_ids: nextSelected,
          ...(product.brand?.id ? { brand_id: product.brand.id } : {}),
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
        onSuccess() {
          toast.success("Update categories successful", { id: toastId });
        },
        onError(error) {
          toast.error("Update categories fail", {
            id: toastId,
            description: getErrorDescription(error),
          });
          setSelectedIds(previous);
        },
      },
    );
  };

  return (
    <div className="flex justify-center text-center w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-center px-2 text-sm  hover:text-foreground"
            disabled={isLoading || isError || editProductMutation.isPending}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </span>
            ) : selectedNames.length > 0 ? (
              <span className="line-clamp-2">{selectedNames.join(", ")}</span>
            ) : (
              "—"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[260px] p-0" align="start">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Error loading categories
            </div>
          ) : (
            <Command>
              <CommandInput
                placeholder="Search categories..."
                className="h-10"
              />
              <CommandList className="max-h-[320px]">
                <CommandEmpty>No categories available</CommandEmpty>
                <CommandGroup>
                  {flatOptions.map((option) => {
                    const isSelected = selectedIds.includes(option.id);

                    if (option.isParent) {
                      return (
                        <div
                          key={option.id}
                          className="px-3 py-2 text-sm font-semibold text-muted-foreground cursor-default"
                          style={{
                            paddingLeft: `${option.depth * 12 + 12}px`,
                          }}
                        >
                          {option.name}
                        </div>
                      );
                    }

                    return (
                      <CommandItem
                        key={option.id}
                        onSelect={() => {
                          const nextSelected = isSelected
                            ? selectedIds.filter((id) => id !== option.id)
                            : [...selectedIds, option.id];
                          handleUpdateCategories(nextSelected);
                        }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => {}}
                          className="pointer-events-none"
                        />
                        <span
                          className="truncate"
                          style={{ paddingLeft: `${option.depth * 12}px` }}
                        >
                          {option.name}
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

function EditableCarrierCell({ product }: { product: ProductItem }) {
  const [editing, setEditing] = useState(false);
  const editProductMutation = useEditProduct();

  const normalizedCarrier =
    product.carrier === "spedition" ? "amm" : (product.carrier ?? "");

  const carrierOptions = useMemo(() => {
    return CARRIERS.filter((carrier) => carrier.id !== "spedition").map(
      (carrier) => ({
        ...carrier,
        label: carrier.id === "amm" ? "Spedition" : carrier.id.toUpperCase(),
      }),
    );
  }, []);

  const handleUpdateCarrier = (value: string) => {
    const nextCarrier = value === "spedition" ? "amm" : value;

    const toastId = toast.loading("Updating carrier...");
    editProductMutation.mutate(
      {
        input: {
          ...product,
          carrier: nextCarrier,
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
          brand_id: product.brand ? product.brand.id : null,
        },
        id: product.id,
      },
      {
        onSuccess() {
          toast.success("Update carrier successful", { id: toastId });
          setEditing(false);
        },
        onError(error) {
          toast.error("Update carrier failed", {
            id: toastId,
            description: getErrorDescription(error),
          });
        },
      },
    );
  };

  return (
    <div className="flex items-center justify-center">
      {editing ? (
        <Select
          value={normalizedCarrier}
          onOpenChange={(open) => {
            if (!open && !editProductMutation.isPending) {
              setEditing(false);
            }
          }}
          onValueChange={(val) => handleUpdateCarrier(val)}
          disabled={editProductMutation.isPending}
        >
          <SelectTrigger className="w-32 border">
            <SelectValue placeholder="Select carrier" />
          </SelectTrigger>
          <SelectContent>
            {carrierOptions.map((carrier) => (
              <SelectItem key={carrier.id} value={carrier.id}>
                <div className="flex items-center gap-2">
                  <Image
                    src={carrier.logo}
                    alt={carrier.id}
                    width={28}
                    height={18}
                    className="object-contain"
                  />
                  <span className="uppercase">{carrier.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <button
          type="button"
          className="flex items-center justify-center cursor-pointer"
          onClick={() => setEditing(true)}
        >
          {(() => {
            const logo = normalizedCarrier
              ? getCarrierLogo(normalizedCarrier)
              : null;

            if (!logo) {
              return <span className="text-muted-foreground">—</span>;
            }

            return (
              <Image
                src={logo}
                alt={normalizedCarrier}
                width={60}
                height={40}
                unoptimized
                className="object-contain"
              />
            );
          })()}
        </button>
      )}
    </div>
  );
}

function ToggleProductStatus({ product }: { product: ProductItem }) {
  const editProductMutation = useEditProduct();

  const handleToggleStatus = () => {
    const missingFields: string[] = [];

    if (product.static_files.length === 0) missingFields.push("Images");
    if (!product.name) missingFields.push("Product name");
    if (!product.final_price) missingFields.push("Final price");
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

    const toastId = toast.loading("Updating product status...");
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
          brand_id: product.brand ? product.brand.id : null,
        },
        id: product.id,
      },
      {
        onSuccess() {
          toast.success("Update product status successful", { id: toastId });
        },
        onError(error) {
          toast.error("Update product status fail", {
            id: toastId,
            description: getErrorDescription(error),
          });
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

      <Link
        href={`/product/${product.url_key}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="ghost" size="icon">
          <Eye className="w-4 h-4 text-secondary" />
        </Button>
      </Link>
      <Link href={`/admin/products/${product.id}/clone`} prefetch={true}>
        <Button variant="ghost" size="icon">
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
    header: ({}) => <div className="text-center">ID</div>,
    cell: ({ row }) => {
      return <EditProductDrawer product={row.original} />;
    },
  },
  {
    accessorKey: "name",
    meta: { width: "200px" },
    header: ({ column }) => (
      <>NAME</>
      // <Button
      //   variant={"ghost"}
      //   className="font-semibold flex items-center px-0 justify-center gap-1 w-fit"
      //   onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      // >
      //   <div>NAME</div>
      //   <div className="mb-0.5">
      //     {{
      //       asc: "↑",
      //       desc: "↓",
      //     }[column.getIsSorted() as string] ?? "↕"}
      //   </div>
      // </Button>
    ),
    // cell: ({ row }) => <EditableNameCell product={row.original} />,
    cell: ({ row }) => <EditableNameCell product={row.original} />,
    enableSorting: true,
  },
  {
    accessorKey: "sku",
    header: ({ column }) => {
      const direction = column.getIsSorted() as "asc" | "desc" | undefined;
      return (
        <Button
          variant="ghost"
          className="font-semibold flex items-center px-0 justify-center gap-1 w-full"
          onClick={() => column.toggleSorting(direction === "asc")}
        >
          <div className="text-center">SKU</div>
          <div className="mb-0.5">
            {direction === "asc" ? "↑" : direction === "desc" ? "↓" : "↕"}
          </div>
        </Button>
      );
    },
    cell: ({ row }) => <EditableSkuCell product={row.original} />,
    enableSorting: true,
    sortingFn: sortByHasValue,
  },
  {
    accessorKey: "brand",
    header: ({ column }) => {
      const direction = column.getIsSorted() as "asc" | "desc" | undefined;
      return (
        <Button
          variant="ghost"
          className="font-semibold flex items-center px-0 justify-center gap-1 w-full"
          onClick={() => column.toggleSorting(direction === "asc")}
        >
          <div className="text-center">Brand</div>
          <div className="mb-0.5">
            {direction === "asc" ? "↑" : direction === "desc" ? "↓" : "↕"}
          </div>
        </Button>
      );
    },
    cell: ({ row }) => <EditableBrandCell product={row.original} />,
    enableSorting: true,
    sortingFn: sortByHasValue,
  },
  {
    accessorKey: "ean",
    header: ({ column }) => {
      const direction = column.getIsSorted() as "asc" | "desc" | undefined;
      return (
        <Button
          variant="ghost"
          className="font-semibold flex items-center px-0 justify-center gap-1 w-full"
          onClick={() => column.toggleSorting(direction === "asc")}
        >
          <div className="text-center">EAN</div>
          <div className="mb-0.5">
            {direction === "asc" ? "↑" : direction === "desc" ? "↓" : "↕"}
          </div>
        </Button>
      );
    },
    cell: ({ row }) => <EditableEanCell product={row.original} />,
    enableSorting: true,
    sortingFn: sortByHasValue,
  },
  {
    accessorKey: "owner",
    meta: { width: "200px" },
    header: ({}) => <div className="text-center">SUPPLIER</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center text-wrap line-clamp-2">
          <EditTableSupplierCell product={row.original} />
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    meta: { width: 200 },
    header: ({ column }) => <div className="text-center">CATEGORY</div>,
    cell: ({ row }) => <EditableCategoryCell product={row.original} />,
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
      const toNum = (v: unknown) =>
        typeof v === "number" ? v : Number(v) || 0;

      const computedStock =
        toNum(stock) - Math.abs(toNum(row.original.result_stock));

      return (
        <div
          className={cn(
            "text-center text-white rounded-xl px-2 py-1",
            computedStock === 0
              ? "bg-red-500 text-white"
              : computedStock < 10
                ? "bg-gray-400"
                : computedStock <= 20
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
    cell: ({ row }) => <ToggleProductStatus product={row.original} />,
  },
  {
    accessorKey: "color",
    header: ({ column }) => {
      const direction = column.getIsSorted() as "asc" | "desc" | undefined;
      return (
        <Button
          variant="ghost"
          className="font-semibold flex items-center px-0 justify-center gap-1 w-full"
          onClick={() => column.toggleSorting(direction === "asc")}
        >
          <div className="text-center">Color</div>
          <div className="mb-0.5">
            {direction === "asc" ? "↑" : direction === "desc" ? "↓" : "↕"}
          </div>
        </Button>
      );
    },
    cell: ({ row }) => <EditableColorCell product={row.original} />,
    enableSorting: true,
    sortingFn: sortByHasValue,
  },
  {
    accessorKey: "materials",
    header: ({ column }) => {
      const direction = column.getIsSorted() as "asc" | "desc" | undefined;
      return (
        <Button
          variant="ghost"
          className="font-semibold flex items-center px-0 justify-center gap-1 w-full"
          onClick={() => column.toggleSorting(direction === "asc")}
        >
          <div className="text-center">Materials</div>
          <div className="mb-0.5">
            {direction === "asc" ? "↑" : direction === "desc" ? "↓" : "↕"}
          </div>
        </Button>
      );
    },
    cell: ({ row }) => <EditableMaterialsCell product={row.original} />,
    enableSorting: true,
    sortingFn: sortByHasValue,
  },
  {
    accessorKey: "component",
    meta: { width: 150 },
    header: ({ column }) => {
      const direction = column.getIsSorted() as "asc" | "desc" | undefined;
      return (
        <Button
          variant="ghost"
          className="font-semibold flex items-center px-0 justify-center gap-1 w-fit mx-auto"
          onClick={() => column.toggleSorting(direction === "asc")}
        >
          <div>Component</div>
          <div className="mb-0.5">
            {direction === "asc" ? "↑" : direction === "desc" ? "↓" : "↕"}
          </div>
        </Button>
      );
    },
    cell: ({ row }) => <EditableComponentCell product={row.original} />,
    enableSorting: true,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId);
      const b = rowB.getValue(columnId);
      const aHasValue =
        a !== null && a !== undefined && String(a).trim() !== "";
      const bHasValue =
        b !== null && b !== undefined && String(b).trim() !== "";

      if (aHasValue === bHasValue) return 0;
      return aHasValue ? 1 : -1;
    },
  },
  {
    accessorKey: "cost",
    header: ({ column }) => {
      const direction = column.getIsSorted() as "asc" | "desc" | undefined;
      return (
        <Button
          variant="ghost"
          className="font-semibold flex items-center px-0 justify-center gap-1 w-full"
          onClick={() => column.toggleSorting(direction === "asc")}
        >
          <div className="text-center">COST</div>
          <div className="mb-0.5">
            {direction === "asc" ? "↑" : direction === "desc" ? "↓" : "↕"}
          </div>
        </Button>
      );
    },
    cell: ({ row }) => <EditableCostCell product={row.original} />,
    enableSorting: true,
    sortingFn: sortByHasValue,
  },

  {
    accessorKey: "shipping_cost",
    header: ({ column }) => {
      const direction = column.getIsSorted() as "asc" | "desc" | undefined;
      return (
        <Button
          variant="ghost"
          className="font-semibold flex items-center px-0 justify-center gap-1 w-full"
          onClick={() => column.toggleSorting(direction === "asc")}
        >
          <div className="text-center">DELIVERY COST</div>
          <div className="mb-0.5">
            {direction === "asc" ? "↑" : direction === "desc" ? "↓" : "↕"}
          </div>
        </Button>
      );
    },
    cell: ({ row }) => <EditableDeliveryCostCell product={row.original} />,
    enableSorting: true,
    sortingFn: sortByHasValue,
  },
  {
    accessorKey: "final_price",
    header: ({ column }) => {
      const direction = column.getIsSorted() as "asc" | "desc" | undefined;
      return (
        <Button
          variant="ghost"
          className="font-semibold flex items-center px-0 justify-center gap-1 w-full"
          onClick={() => column.toggleSorting(direction === "asc")}
        >
          <div className="text-center">FINAL PRICE</div>
          <div className="mb-0.5">
            {direction === "asc" ? "↑" : direction === "desc" ? "↓" : "↕"}
          </div>
        </Button>
      );
    },
    cell: ({ row }) => <EdittbalePriceCell product={row.original} />,
    enableSorting: true,
    sortingFn: sortByHasValue,
  },
  {
    id: "margin",
    header: () => <div className="text-center">MARGIN</div>,
    cell: ({ row }) => {
      const { final_price, cost, tax } = row.original;

      const salePrice = Number(final_price);
      const purchaseCost = Number(cost);
      const vatRate = parseFloat(tax) / 100;

      // 🛡️ Guard tất cả case lỗi
      if (
        !Number.isFinite(salePrice) ||
        !Number.isFinite(purchaseCost) ||
        salePrice <= 0
      ) {
        return <div className="text-center">—</div>;
      }

      const margin = (1 - (purchaseCost * (1 + vatRate)) / salePrice) * 100;

      return (
        <div className="text-right">
          {Number.isFinite(margin) ? margin.toFixed(1) : "—"}%
        </div>
      );
    },
  },
  {
    accessorKey: "carrier",
    header: ({ column }) => {
      const direction = column.getIsSorted() as "asc" | "desc" | undefined;
      return (
        <Button
          variant="ghost"
          className="font-semibold flex items-center px-0 justify-center gap-1 w-full"
          onClick={() => column.toggleSorting(direction === "asc")}
        >
          <div className="text-center">CARRIER</div>
          <div className="mb-0.5">
            {direction === "asc" ? "↑" : direction === "desc" ? "↓" : "↕"}
          </div>
        </Button>
      );
    },
    cell: ({ row }) => <EditableCarrierCell product={row.original} />,
    enableSorting: true,
    sortingFn: sortByHasValue,
  },

  {
    id: "actions",
    header: "ACTION",
    cell: ({ row }) => <ActionsCell product={row.original} />,
  },
];
