"use client";

import { useMemo, useState } from "react";
import { Loader2, Pencil, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useUpdateMainCheckout } from "@/features/checkout/hook";
import { cn } from "@/lib/utils";
import type { CartItem } from "@/types/cart";

interface EditOrderItemPricesDrawerProps {
  mainCheckoutId: string;
  items: CartItem[];
}

interface EditableOrderItem {
  idProvider: string;
  name: string;
  sku: string;
  ean: string;
  quantity: number;
  oldPrice: number;
}

const toNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const parsePrice = (value: string) => {
  const normalized = value.trim().replace(/\s/g, "");
  if (!normalized) return Number.NaN;

  return Number(
    normalized.includes(",")
      ? normalized.replaceAll(".", "").replace(",", ".")
      : normalized,
  );
};

const formatEuro = (value: number) =>
  value.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getEditableOrderItems = (items: CartItem[]): EditableOrderItem[] => {
  const itemsByProvider = new Map<string, EditableOrderItem>();

  items.forEach((item) => {
    const idProvider = String(
      item.purchased_products?.id_provider ?? item.products?.id_provider ?? "",
    ).trim();
    if (!idProvider) return;

    const existingItem = itemsByProvider.get(idProvider);
    if (existingItem) {
      existingItem.quantity += toNumber(item.quantity);
      return;
    }

    itemsByProvider.set(idProvider, {
      idProvider,
      name:
        item.purchased_products?.name ?? item.products?.name ?? "Unnamed product",
      sku: item.purchased_products?.sku ?? item.products?.sku ?? "",
      ean: item.purchased_products?.ean ?? item.products?.ean ?? "",
      quantity: toNumber(item.quantity),
      oldPrice: toNumber(
        item.purchased_products?.final_price ??
          item.products?.final_price ??
          item.final_price ??
          item.item_price,
      ),
    });
  });

  return Array.from(itemsByProvider.values());
};

const EditOrderItemPricesDrawer = ({
  mainCheckoutId,
  items,
}: EditOrderItemPricesDrawerProps) => {
  const updateMainCheckoutMutation = useUpdateMainCheckout();
  const editableItems = useMemo(() => getEditableOrderItems(items), [items]);
  const [open, setOpen] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [newPrices, setNewPrices] = useState<Record<string, string>>({});
  const areAllItemsSelected =
    editableItems.length > 0 && selectedItemIds.size === editableItems.length;

  const handleOpenChange = (nextOpen: boolean) => {
    if (updateMainCheckoutMutation.isPending) return;
    setOpen(nextOpen);
    if (nextOpen) {
      setSelectedItemIds(new Set());
      setNewPrices({});
    }
  };

  const toggleItem = (idProvider: string, checked: boolean) => {
    setSelectedItemIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(idProvider);
      } else {
        next.delete(idProvider);
      }
      return next;
    });
  };

  const toggleAllItems = () => {
    setSelectedItemIds(
      areAllItemsSelected
        ? new Set()
        : new Set(editableItems.map((item) => item.idProvider)),
    );
  };

  const selectedPriceEntries = editableItems
    .filter((item) => selectedItemIds.has(item.idProvider))
    .map((item) => ({
      id_provider: item.idProvider,
      price: parsePrice(newPrices[item.idProvider] ?? ""),
    }));
  const hasInvalidSelectedPrice = selectedPriceEntries.some(
    (item) => !Number.isFinite(item.price) || item.price < 0,
  );
  const canSubmit =
    selectedPriceEntries.length > 0 &&
    !hasInvalidSelectedPrice &&
    !updateMainCheckoutMutation.isPending;

  const handleUpdateItemPrices = async () => {
    if (!canSubmit) return;

    try {
      await updateMainCheckoutMutation.mutateAsync({
        main_checkout_id: mainCheckoutId,
        payload: {
          item_prices: selectedPriceEntries.map((item) => ({
            id_provider: item.id_provider,
            price: Number(item.price.toFixed(2)),
          })),
        },
      });
      toast.success("Item prices updated successfully");
      setOpen(false);
    } catch {
      toast.error("Failed to update item prices");
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={handleOpenChange}
      direction="right"
      handleOnly
    >
      <DrawerTrigger asChild>
        <Button
          type="button"
          className="bg-secondary text-white hover:bg-secondary/90"
          disabled={editableItems.length === 0}
        >
          <Pencil className="size-4" />
          Edit item prices
        </Button>
      </DrawerTrigger>

      <DrawerContent className="w-[92vw] max-w-none overflow-hidden p-0 data-[vaul-drawer-direction=right]:sm:max-w-[760px]">
        <DrawerHeader className="relative border-b px-6 py-5 pr-16">
          <DrawerTitle>Edit item prices</DrawerTitle>
          <DrawerDescription>
            Select only the products whose prices you want to update.
          </DrawerDescription>
          <DrawerClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close item price editor"
              className="absolute right-4 top-4"
              disabled={updateMainCheckoutMutation.isPending}
            >
              <X className="size-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={toggleAllItems}
              disabled={updateMainCheckoutMutation.isPending}
            >
              {areAllItemsSelected ? "Clear all" : "Select all"}
            </Button>
          </div>

          {editableItems.map((item) => {
            const isSelected = selectedItemIds.has(item.idProvider);
            const priceInput = newPrices[item.idProvider] ?? "";
            const parsedPrice = parsePrice(priceInput);
            const showPriceError =
              isSelected &&
              priceInput.trim() !== "" &&
              (!Number.isFinite(parsedPrice) || parsedPrice < 0);

            return (
              <div
                key={item.idProvider}
                className={cn(
                  "rounded-2xl border p-4 transition-all",
                  isSelected
                    ? "border-secondary/40 bg-secondary/5 shadow-sm"
                    : "border-slate-200 bg-slate-50/80",
                )}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      toggleItem(item.idProvider, checked === true)
                    }
                    aria-label={`Select ${item.name}`}
                    className="mt-1"
                  />

                  <div
                    className={cn(
                      "min-w-0 flex-1 space-y-4 transition-all",
                      isSelected ? "opacity-100" : "blur-[0.35px] opacity-55",
                    )}
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        {item.name}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>ID: {item.idProvider}</span>
                        <span>SKU: {item.sku || "—"}</span>
                        <span>EAN: {item.ean || "—"}</span>
                        <span>Quantity: {item.quantity}</span>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label
                          htmlFor={`old-price-${item.idProvider}`}
                          className="text-sm font-medium text-slate-700"
                        >
                          Old price
                        </label>
                        <Input
                          id={`old-price-${item.idProvider}`}
                          readOnly
                          value={formatEuro(item.oldPrice)}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor={`new-price-${item.idProvider}`}
                          className="text-sm font-medium text-slate-700"
                        >
                          New price (€)
                        </label>
                        <Input
                          id={`new-price-${item.idProvider}`}
                          type="text"
                          inputMode="decimal"
                          placeholder="Enter new price"
                          value={priceInput}
                          disabled={
                            !isSelected || updateMainCheckoutMutation.isPending
                          }
                          className="bg-white disabled:bg-white"
                          onChange={(event) =>
                            setNewPrices((current) => ({
                              ...current,
                              [item.idProvider]: event.target.value,
                            }))
                          }
                        />
                        {isSelected && !priceInput.trim() ? (
                          <p className="text-sm text-muted-foreground">
                            New price is required for selected products.
                          </p>
                        ) : showPriceError ? (
                          <p className="text-sm text-destructive">
                            Price must be zero or greater.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <DrawerFooter className="border-t bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedItemIds.size} of {editableItems.length} products selected
          </div>
          <div className="flex justify-end gap-2">
            <DrawerClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={updateMainCheckoutMutation.isPending}
              >
                Cancel
              </Button>
            </DrawerClose>
            <Button
              type="button"
              onClick={handleUpdateItemPrices}
              disabled={!canSubmit}
            >
              {updateMainCheckoutMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update selected prices"
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default EditOrderItemPricesDrawer;
