import { useGetAllProducts } from "@/features/products/hook";
import React, { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Loader2,
  Pencil,
  PencilOffIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProductItem } from "@/types/products";
import { toast } from "sonner";
import Image from "next/image";
import {
  createInventoryPo,
  getContainerInventory,
  updateInventoryPo,
} from "@/features/incoming-inventory/inventory/api";
import { useDeleteInventoryPo } from "@/features/incoming-inventory/inventory/hook";
import { useUpdateProductStockFromInventoryPo } from "@/features/incoming-inventory/po/hook";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SelectedInventoryItem {
  inventory_po_id?: string;
  product_id?: string;
  name: string;
  image?: string;
  provider_id?: string;
  sku?: string;

  quantity: number;
  unit_cost: number;
  description?: string;
  total_cost: number;
  stock_from_amm?: number | null;
  updated_stock?: boolean | null;

  isNew?: boolean;
  isEditing?: boolean; // 👈 thêm

  original?: {
    quantity: number;
    unit_cost: number;
    description?: string;
    total_cost: number;
  };
}

interface InventorySelectProps {
  containerId: string;
  po_id: string;
  // delivery_date: string
}

function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const InventorySelect = ({ containerId, po_id }: InventorySelectProps) => {
  void po_id;
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { mutate: deleteInventoryPoMutate } = useDeleteInventoryPo(containerId);
  const updateStockMutation = useUpdateProductStockFromInventoryPo();

  const { data: products, isLoading } = useGetAllProducts({
    search: debouncedSearch,
    page_size: 20,
  });

  const [items, setItems] = React.useState<SelectedInventoryItem[]>([]);
  const [open, setOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmStock, setConfirmStock] = useState<number | "">("");
  const [confirmTargetIndex, setConfirmTargetIndex] = useState<number | null>(
    null,
  );
  const productOptions = React.useMemo<ProductItem[]>(() => {
    const rawProducts = products as
      | { items?: ProductItem[]; results?: ProductItem[] }
      | ProductItem[]
      | undefined;

    if (Array.isArray(rawProducts)) return rawProducts;
    if (Array.isArray(rawProducts?.items)) return rawProducts.items;
    if (Array.isArray(rawProducts?.results)) return rawProducts.results;

    return [];
  }, [products]);

  const filteredProductOptions = React.useMemo(
    () =>
      productOptions.filter(
        (product) => !items.some((selected) => selected.product_id === product.id),
      ),
    [productOptions, items],
  );

  const handleSelectProduct = (product: ProductItem) => {
    setItems((prev) => {
      const exists = prev.find((p) => p.product_id === product.id);
      if (exists) return prev;

      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          image:
            product.static_files && product.static_files.length > 0
              ? product.static_files[0].url
              : "/1.png",
          provider_id: product.id_provider,
          sku: product.sku,
          quantity: 0,
          unit_cost: 0,
          total_cost: 0,
          stock_from_amm: null,
          updated_stock: null,
          isNew: true,
          isEditing: true, // 👈 NEW item edit được ngay
        },
      ];
    });

    setOpen(false);
  };

  const handleDeleteItem = (item: SelectedInventoryItem, index: number) => {
    // 🆕 Item mới thêm, chưa save → chỉ xoá local
    if (item.isNew || !item.inventory_po_id) {
      setItems((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    // 🧱 Item đã tồn tại trên backend → gọi API delete
    deleteInventoryPoMutate(item.inventory_po_id, {
      onSuccess: () => {
        // Optimistic update UI
        setItems((prev) => prev.filter((_, i) => i !== index));
        toast.success("Inventory item deleted");
      },
      onError: () => {
        toast.error("Failed to delete inventory item");
      },
    });
  };

  const validateItems = (): boolean => {
    if (items.length === 0) {
      toast.error("No product selected", {
        description: "Please add at least one product before saving.",
      });
      return false;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // if (!item.image || item.image === "/1.png") {
      //   toast.error("Missing product image", {
      //     description: `Product "${item.name}" does not have a valid image.`,
      //   });
      //   return false;
      // }

      if (!item.quantity || item.quantity <= 0) {
        toast.error("Invalid quantity", {
          description: `Please enter quantity for "${item.name}".`,
        });
        return false;
      }

      if (!item.unit_cost || item.unit_cost <= 0) {
        toast.error("Invalid unit cost", {
          description: `Please enter unit cost for "${item.name}".`,
        });
        return false;
      }

      if (!item.description || item.description.trim() === "") {
        toast.error("Missing description", {
          description: `Please enter description for "${item.name}".`,
        });
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateItems()) return;

    const newItems = items.filter((i) => i.isNew);
    const updatedItems = items.filter(
      (i) => !i.isNew && i.inventory_po_id && isItemChanged(i),
    );

    if (newItems.length === 0 && updatedItems.length === 0) {
      toast.info("Nothing to save", {
        description: "No changes detected.",
      });
      return;
    }

    try {
      // CREATE
      for (const item of newItems) {
        await createInventoryPo({
          container_id: containerId,
          product_id: item.product_id!,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          total_cost: item.total_cost,
          description: item.description,
          // list_delivery_date:
        });
      }

      // UPDATE
      for (const item of updatedItems) {
        await updateInventoryPo(item.inventory_po_id!, {
          container_id: containerId,
          product_id: item.product_id!,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          total_cost: item.total_cost,
          description: item.description,
        });
      }

      toast.success("Inventory updated", {
        description: `Added ${newItems.length}, updated ${updatedItems.length}`,
      });

      // 👇 ĐẶT Ở ĐÂY
      setItems((prev) =>
        prev.map((i) => ({
          ...i,
          isEditing: false,
          isNew: false,
        })),
      );

      await fetchInventory(); // reload lại state chuẩn từ backend
    } catch {
      toast.error("Failed to save inventory", {
        description: "Please try again.",
      });
    }
  };

  const fetchInventory = React.useCallback(async () => {
    try {
      const data = await getContainerInventory(containerId);

      const mappedItems: SelectedInventoryItem[] = data.map((item) => ({
        inventory_po_id: item.id,
        product_id: item.product.id,
        name: item.product.name,
        image: item.product.image ? item.product.image : "/1.png",
        provider_id: item.product.id_provider,
        sku: item.product.sku,

        quantity: item.quantity,
        unit_cost: item.unit_cost,
        total_cost: item.total_cost,
        description: item.description ?? "",
        stock_from_amm: item.stock_from_amm ?? null,
        updated_stock: item.updated_stock ?? null,

        isNew: false,
        isEditing: false, // 👈 LOCK

        original: {
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          total_cost: item.total_cost,
          description: item.description ?? "",
        },
      }));

      setItems(mappedItems);
    } catch {
      toast.error("Failed to load inventory", {
        description: "Could not fetch container inventory.",
      });
    }
  }, [containerId]);

  const handleOpenConfirmStock = (index: number) => {
    const item = items[index];
    if (!item || !item.inventory_po_id) {
      toast.error("This item must be saved before confirming stock.");
      return;
    }

    setConfirmTargetIndex(index);
    setConfirmStock(item.stock_from_amm ?? "");
    setConfirmOpen(true);
  };

  const handleConfirmStock = () => {
    if (confirmTargetIndex === null) return;
    const target = items[confirmTargetIndex];
    if (!target?.inventory_po_id) return;

    const parsedStock = Number(confirmStock);
    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      toast.error("Stock must be a valid number greater than or equal to 0.");
      return;
    }
    if (!Number.isInteger(parsedStock)) {
      toast.error("Stock must be an integer.");
      return;
    }

    updateStockMutation.mutate(
      {
        inventoryPoId: target.inventory_po_id,
        stock: parsedStock,
      },
      {
        onSuccess: () => {
          setItems((prev) =>
            prev.map((item, idx) =>
              idx === confirmTargetIndex
                ? {
                    ...item,
                    stock_from_amm: parsedStock,
                    updated_stock: true,
                  }
                : item,
            ),
          );
          toast.success("Stock confirmed successfully.");
          void fetchInventory();
          setConfirmOpen(false);
          setConfirmTargetIndex(null);
        },
        onError: () => {
          toast.error("Failed to confirm stock.");
        },
      },
    );
  };

  const isItemChanged = (item: SelectedInventoryItem) => {
    if (!item.original) return false;

    return (
      item.quantity !== item.original.quantity ||
      item.unit_cost !== item.original.unit_cost ||
      item.total_cost !== item.original.total_cost ||
      (item.description ?? "") !== (item.original.description ?? "")
    );
  };

  useEffect(() => {
    if (!containerId) return;

    fetchInventory();
  }, [containerId, fetchInventory]);

  console.log(isLoading);

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2 w-full">
            <Plus className="h-4 w-4" />
            Add product
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-3/4 mx-auto p-0"
          align="center"
          sideOffset={8}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search product..."
              value={search}
              onValueChange={setSearch}
            />

            <CommandList className="max-h-[350px] overflow-y-auto">
              {isLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {!isLoading && filteredProductOptions.length === 0 && (
                <CommandEmpty>No product found.</CommandEmpty>
              )}

              {!isLoading && filteredProductOptions.length > 0 && (
                <CommandGroup>
                  {filteredProductOptions.map((product: ProductItem, index) => (
                    <CommandItem
                      key={
                        product.id ??
                        `${product.id_provider ?? "product"}-${index}`
                      }
                      value={
                        product.id ??
                        product.id_provider ??
                        product.sku ??
                        product.name ??
                        `product-${index}`
                      }
                      onSelect={() => handleSelectProduct(product)}
                      className="flex items-center gap-3"
                    >
                      <Image
                        src={
                          product.static_files &&
                          product.static_files.length > 0
                            ? product.static_files[0].url
                            : "/1.png"
                        }
                        alt={product.name || "product"}
                        height={25}
                        width={25}
                        className="rounded-sm object-cover"
                        unoptimized
                      />

                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {product.name || "Unnamed product"}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          ID: {product.id_provider || "-"} | SKU:{" "}
                          {product.sku?.trim() ? product.sku : "-"}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {items && items.length > 0 && (
        <div className="mt-6 border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-2 text-left">Product</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Unit cost</th>
                <th className="p-2">Total</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <React.Fragment key={item.product_id}>
                  {/* MAIN ROW */}
                  <tr
                    className={`border-t ${
                      item.updated_stock === true ? "bg-emerald-50/70" : ""
                    }`}
                  >
                    <td className="p-2">
                      <div className="flex gap-2 items-center">
                        <Image
                          src={item.image}
                          alt={item.name || "product"}
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded object-cover"
                          unoptimized
                        />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {item.provider_id || "-"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            SKU: {item.sku || "-"}
                          </div>
                          {/* <div className="text-xs text-muted-foreground">
                            {item. ??""}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.sk}
                          </div> */}
                        </div>
                      </div>
                    </td>

                    <td className="p-2">
                      <Input
                        type="number"
                        min={0}
                        value={item.quantity}
                        disabled={!item.isEditing}
                        onChange={(e) => {
                          const quantity = Number(e.target.value);
                          setItems((prev) =>
                            prev.map((p, i) =>
                              i === index
                                ? {
                                    ...p,
                                    quantity,
                                    total_cost: quantity * p.unit_cost,
                                  }
                                : p,
                            ),
                          );
                        }}
                      />
                    </td>

                    <td className="p-2">
                      <Input
                        type="number"
                        min={0}
                        value={item.unit_cost}
                        disabled={!item.isEditing}
                        onChange={(e) => {
                          const unit_cost = Number(e.target.value);
                          setItems((prev) =>
                            prev.map((p, i) =>
                              i === index
                                ? {
                                    ...p,
                                    unit_cost,
                                    total_cost: p.quantity * unit_cost,
                                  }
                                : p,
                            ),
                          );
                        }}
                      />
                    </td>

                    <td className="p-2 font-medium whitespace-nowrap">
                      {item.total_cost.toLocaleString("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </td>

                    <td className="p-2 text-right flex justify-end gap-1 h-full">
                      {/* EDIT */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setItems((prev) =>
                            prev.map((p, i) =>
                              i === index
                                ? { ...p, isEditing: !p.isEditing }
                                : p,
                            ),
                          )
                        }
                      >
                        {item.isEditing ? (
                          <PencilOffIcon className="h-4 w-4 text-primary" />
                        ) : (
                          <Pencil className="h-4 w-4 text-primary" />
                        )}
                      </Button>

                      {/* DELETE */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteItem(item, index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>

                  <tr
                    className={
                      item.updated_stock === true
                        ? "bg-emerald-50/40 border-t"
                        : "bg-muted/20 border-t"
                    }
                  >
                    <td colSpan={5} className="px-2 py-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-muted-foreground">
                            Stock from AMM:
                          </span>
                          <span className="font-semibold">
                            {item.stock_from_amm ?? "-"}
                          </span>
                          {item.updated_stock === true && (
                            <span className="text-emerald-700 text-xs font-medium">
                              Confirmed
                            </span>
                          )}
                        </div>

                        {(item.updated_stock === null ||
                          item.updated_stock === false) &&
                        item.inventory_po_id ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => handleOpenConfirmStock(index)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Confirm
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>

                  {/* DESCRIPTION ROW */}
                  <tr
                    className={
                      item.updated_stock === true
                        ? "bg-emerald-50/40"
                        : "bg-muted/40"
                    }
                  >
                    <td colSpan={5} className="p-2 pt-0">
                      <textarea
                        className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm
             focus:outline-none focus:ring-2 focus:ring-ring
             disabled:opacity-50"
                        placeholder="Description / note"
                        value={item.description ?? ""}
                        disabled={!item.isEditing}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((p, i) =>
                              i === index
                                ? { ...p, description: e.target.value }
                                : p,
                            ),
                          )
                        }
                      />
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-end gap-2 p-4  bg-background">
        <Button
          type="button"
          onClick={handleSave}
          disabled={items.length === 0}
        >
          Save inventory
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm stock from AMM</DialogTitle>
            <DialogDescription>
              Enter the stock value to confirm for this inventory item.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Stock</p>
            <Input
              type="number"
              min={0}
              step={1}
              value={confirmStock}
              onChange={(e) =>
                setConfirmStock(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={updateStockMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmStock}
              disabled={updateStockMutation.isPending}
            >
              {updateStockMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventorySelect;
