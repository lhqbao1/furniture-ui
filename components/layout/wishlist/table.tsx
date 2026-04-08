"use client";

import React, { useCallback, useMemo, useState } from "react";
import { debounce } from "lodash";
import { toast } from "sonner";
import Image from "next/image";
import { ArrowLeft, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import ProductTableSkeleton from "@/components/shared/skeleton/table-skeleton";
import { WishListItem, WishListResponse } from "@/types/wishlist";
import {
  useAddWishlistItemToCart,
  useRemoveWishlistItem,
  useUpdateWishlistItemQuantity,
  useUpdateWishlistItemStatus,
} from "@/features/wishlist/hook";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/src/i18n/navigation";
import { cn } from "@/lib/utils";
import { calculateAvailableStock } from "@/hooks/calculate_available_stock";
import { calculateIncomingStockSummary } from "@/hooks/calculate_incoming_stock";

interface WishlistTableProps {
  wishlist?: WishListResponse;
  isLoadingWishlist?: boolean;
  isCheckout?: boolean;
  localQuantities: Record<string, number>;
  setLocalQuantities: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
  total: number;
  currentTable?: string;
}

type WishlistValidation = {
  isValid: boolean;
  message: string;
  maxStock: number;
  quantity: number;
};

const formatCurrency = (value: number) =>
  `${Number(value ?? 0).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;

const WishlistTable = ({
  wishlist,
  isLoadingWishlist,
  isCheckout = false,
  localQuantities,
  setLocalQuantities,
  total,
  currentTable,
}: WishlistTableProps) => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const [localStatuses, setLocalStatuses] = useState<Record<string, boolean>>(
    {},
  );

  const updateWishlistItemQuantityMutation = useUpdateWishlistItemQuantity();
  const deleteWishlistItemMutation = useRemoveWishlistItem();
  const updateWishlistItemStatusMutation = useUpdateWishlistItemStatus();
  const addItemToWishlistMutation = useAddWishlistItemToCart();

  const wishlistItems = useMemo(() => wishlist?.items ?? [], [wishlist?.items]);

  const getEffectiveStatus = useCallback(
    (item: WishListItem) => localStatuses[item.id] ?? item.is_active,
    [localStatuses],
  );

  const getItemQuantity = useCallback(
    (item: WishListItem) => {
      const value = Number(localQuantities[item.id] ?? item.quantity ?? 1);
      return Number.isFinite(value) && value > 0 ? value : 1;
    },
    [localQuantities],
  );

  const getItemMaxStock = useCallback((item: WishListItem) => {
    const baseStock = calculateAvailableStock(item.products);
    const incomingStock = calculateIncomingStockSummary(item.products)
      .incomingStock;
    return Math.max(0, baseStock + incomingStock);
  }, []);

  const validateWishlistItem = useCallback(
    (item: WishListItem, quantityInput?: number): WishlistValidation => {
      const maxStock = getItemMaxStock(item);
      const quantity = Number(
        quantityInput !== undefined ? quantityInput : getItemQuantity(item),
      );

      if (!item.products?.is_active) {
        return {
          isValid: false,
          message: t("outStock"),
          maxStock,
          quantity,
        };
      }

      const finalPrice = Number(
        item.final_price ?? item.item_price ?? item.products?.final_price,
      );
      if (!Number.isFinite(finalPrice) || finalPrice <= 0) {
        return {
          isValid: false,
          message: t("addToCartFail"),
          maxStock,
          quantity,
        };
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return {
          isValid: false,
          message: t("addToCartFail"),
          maxStock,
          quantity,
        };
      }

      if (maxStock <= 0) {
        return {
          isValid: false,
          message: t("outStock"),
          maxStock,
          quantity,
        };
      }

      if (quantity > maxStock) {
        return {
          isValid: false,
          message: t("notEnoughStock"),
          maxStock,
          quantity,
        };
      }

      return {
        isValid: true,
        message: "",
        maxStock,
        quantity,
      };
    },
    [getItemMaxStock, getItemQuantity, t],
  );

  const selectedItems = useMemo(
    () => wishlistItems.filter((item) => getEffectiveStatus(item)),
    [wishlistItems, getEffectiveStatus],
  );

  const selectedCount = selectedItems.length;
  const selectedTotal = useMemo(
    () =>
      selectedItems.reduce((sum, item) => {
        const quantity = getItemQuantity(item);
        return sum + (Number(item.item_price ?? 0) || 0) * quantity;
      }, 0),
    [selectedItems, getItemQuantity],
  );

  const allSelected =
    wishlistItems.length > 0 && selectedCount === wishlistItems.length;

  const debouncedUpdate = useMemo(
    () =>
      debounce((itemId: string, quantity: number) => {
        updateWishlistItemQuantityMutation.mutate({ itemId, quantity });
      }, 400),
    [updateWishlistItemQuantityMutation],
  );

  React.useEffect(() => {
    return () => debouncedUpdate.cancel();
  }, [debouncedUpdate]);

  const handleToggleSelect = useCallback(
    (item: WishListItem, isActive: boolean) => {
      setLocalStatuses((prev) => ({ ...prev, [item.id]: isActive }));
      updateWishlistItemStatusMutation.mutate({ itemId: item.id, is_active: isActive });
    },
    [updateWishlistItemStatusMutation],
  );

  const handleToggleAll = useCallback(
    (checked: boolean) => {
      const next: Record<string, boolean> = {};
      wishlistItems.forEach((item) => {
        next[item.id] = checked;
        updateWishlistItemStatusMutation.mutate({
          itemId: item.id,
          is_active: checked,
        });
      });
      setLocalStatuses((prev) => ({ ...prev, ...next }));
    },
    [wishlistItems, updateWishlistItemStatusMutation],
  );

  const handleDeleteItem = useCallback(
    (item: WishListItem) => {
      deleteWishlistItemMutation.mutate(
        { itemId: item.id },
        {
          onSuccess: () => toast.success(t("removeItemWishlistSuccess")),
          onError: () => toast.error(t("removeItemWishlistFail")),
        },
      );
    },
    [deleteWishlistItemMutation, t],
  );

  const handleUpdateWishlistItemQuantity = useCallback(
    (item: WishListItem, nextQuantity: number) => {
      if (nextQuantity <= 0) {
        handleDeleteItem(item);
        return;
      }

      const validation = validateWishlistItem(item, nextQuantity);
      if (validation.maxStock <= 0) {
        toast.error(t("outStock"));
        return;
      }

      if (nextQuantity > validation.maxStock) {
        toast.error(t("notEnoughStock"));
        setLocalQuantities((prev) => ({
          ...prev,
          [item.id]: validation.maxStock,
        }));
        debouncedUpdate(item.id, validation.maxStock);
        return;
      }

      setLocalQuantities((prev) => ({ ...prev, [item.id]: nextQuantity }));
      debouncedUpdate(item.id, nextQuantity);
    },
    [debouncedUpdate, handleDeleteItem, setLocalQuantities, t, validateWishlistItem],
  );

  const handleAddToCart = useCallback(
    async (item: WishListItem) => {
      const validation = validateWishlistItem(item);
      if (!validation.isValid) {
        toast.error(validation.message);
        return;
      }

      try {
        if (validation.quantity !== item.quantity) {
          await updateWishlistItemQuantityMutation.mutateAsync({
            itemId: item.id,
            quantity: validation.quantity,
          });
        }
        await addItemToWishlistMutation.mutateAsync({ itemId: item.id });
        toast.success(t("addToCartSuccess"));
      } catch {
        toast.error(t("addToCartFail"));
      }
    },
    [addItemToWishlistMutation, t, updateWishlistItemQuantityMutation, validateWishlistItem],
  );

  const handleAddSelectedToCart = useCallback(async () => {
    if (selectedItems.length === 0) {
      toast.error(t("chooseAtLeastWishlist"));
      return;
    }

    const invalidItem = selectedItems.find(
      (item) => !validateWishlistItem(item).isValid,
    );
    if (invalidItem) {
      const validation = validateWishlistItem(invalidItem);
      toast.error(
        `${invalidItem.products?.name ?? t("product")}: ${validation.message}`,
      );
      return;
    }

    let successCount = 0;
    let failedCount = 0;

    for (const item of selectedItems) {
      const validation = validateWishlistItem(item);
      try {
        if (validation.quantity !== item.quantity) {
          await updateWishlistItemQuantityMutation.mutateAsync({
            itemId: item.id,
            quantity: validation.quantity,
          });
        }
        await addItemToWishlistMutation.mutateAsync({ itemId: item.id });
        successCount += 1;
      } catch {
        failedCount += 1;
      }
    }

    if (successCount > 0) {
      toast.success(t("addToCartSuccess"));
      router.push("/cart", { locale });
      return;
    }

    if (failedCount > 0) {
      toast.error(t("addToCartFail"));
    }
  }, [
    addItemToWishlistMutation,
    locale,
    router,
    selectedItems,
    t,
    updateWishlistItemQuantityMutation,
    validateWishlistItem,
  ]);

  const handleRemoveUnavailable = useCallback(() => {
    const unavailableItems = wishlistItems.filter((item) => {
      const validation = validateWishlistItem(item);
      return !validation.isValid;
    });

    if (unavailableItems.length === 0) {
      toast.success(t("noItems"));
      return;
    }

    unavailableItems.forEach((item) => {
      deleteWishlistItemMutation.mutate({ itemId: item.id });
    });
    toast.success(t("removeItemWishlistSuccess"));
  }, [deleteWishlistItemMutation, t, validateWishlistItem, wishlistItems]);

  if (isLoadingWishlist) {
    return (
      <div className="col-span-12 md:col-span-8 flex-1">
        <ProductTableSkeleton />
      </div>
    );
  }

  if (!wishlist || wishlistItems.length === 0) {
    return (
      <div className="col-span-12 md:col-span-8 flex-1">
        <div className="rounded-2xl border bg-white p-8 md:p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Heart className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-semibold">{t("emptyWishlistTitle")}</h3>
          <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
            {t("emptyWishlistDescription")}
          </p>
          <Button
            className="mt-6 bg-secondary hover:bg-secondary/90 text-white px-8"
            onClick={() => router.push("/shop-all", { locale })}
          >
            {t("continueShopping")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-12 md:col-span-8 flex-1 space-y-6">
      <div className="rounded-2xl border bg-gradient-to-r from-[#f7fbf8] to-white p-5 md:p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold">
              {currentTable ?? t("wishlistProducts")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("wishlistSubtitle")}</p>
          </div>
          <Badge
            variant="outline"
            className="rounded-full px-3 py-1.5 text-sm font-medium"
          >
            {wishlistItems.length} {t("items")}
          </Badge>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-sm">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(value) => handleToggleAll(value === true)}
              aria-label={t("selectAll")}
            />
            <span>{t("selectAll")}</span>
          </label>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              asChild
            >
              <Link href="/shop-all" locale={locale}>
                <ArrowLeft className="size-4" />
                {t("continueShopping")}
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50"
              onClick={handleRemoveUnavailable}
            >
              <Trash2 className="size-4" />
              {t("removeOutOfStockProducts")}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 items-start">
        <div className="col-span-12 xl:col-span-8 space-y-4">
          {wishlistItems.map((item) => {
            const quantity = getItemQuantity(item);
            const maxStock = getItemMaxStock(item);
            const selected = getEffectiveStatus(item);
            const unitPrice = Number(item.item_price ?? 0);
            const linePrice = unitPrice * quantity;
            const isStockValid = maxStock > 0;
            const isAddEnabled =
              item.products?.is_active &&
              isStockValid &&
              quantity > 0 &&
              quantity <= maxStock &&
              Number(item.final_price ?? item.item_price) > 0;

            return (
              <div
                key={item.id}
                className={cn(
                  "rounded-2xl border bg-white p-4 md:p-5 shadow-sm transition",
                  selected
                    ? "border-secondary/30"
                    : "opacity-85 border-border/70",
                )}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex gap-4">
                    {!isCheckout && (
                      <div className="pt-1">
                        <Checkbox
                          checked={selected}
                          onCheckedChange={(value) =>
                            handleToggleSelect(item, value === true)
                          }
                          aria-label={t("selectRow")}
                        />
                      </div>
                    )}

                    <div className="relative h-24 w-24 overflow-hidden rounded-xl border bg-muted/20">
                      <Image
                        src={item.image_url || "/placeholder-product.webp"}
                        alt={item.products?.name ?? t("product")}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {item.products?.brand?.name ?? "Prestige Home"}
                      </p>
                      <p className="mt-1 text-base md:text-lg font-semibold leading-snug">
                        {item.products?.name}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t("itemNumber")}: {item.products?.id_provider}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full",
                            isStockValid
                              ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                              : "border-red-200 text-red-700 bg-red-50",
                          )}
                        >
                          {isStockValid
                            ? `${maxStock} ${t("left")}`
                            : t("outStock")}
                        </Badge>
                        {!item.products?.is_active && (
                          <Badge
                            variant="outline"
                            className="rounded-full border-red-200 text-red-700 bg-red-50"
                          >
                            {t("outStock")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="w-full lg:w-auto lg:min-w-[240px]">
                    <div className="rounded-xl border bg-muted/20 p-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{t("price")}</span>
                        <span className="font-medium text-foreground">
                          {formatCurrency(unitPrice)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t("total")}</span>
                        <span className="text-base font-semibold text-secondary">
                          {formatCurrency(linePrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{t("quantity")}:</span>
                    <div className="flex items-center rounded-lg border overflow-hidden">
                      <button
                        type="button"
                        className="h-9 w-9 border-r hover:bg-muted/50 transition"
                        onClick={() =>
                          handleUpdateWishlistItemQuantity(item, quantity - 1)
                        }
                        aria-label={t("decreaseQuantityAria")}
                      >
                        -
                      </button>
                      <span className="w-12 text-center text-sm font-medium">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        className="h-9 w-9 border-l hover:bg-muted/50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={() =>
                          handleUpdateWishlistItemQuantity(item, quantity + 1)
                        }
                        aria-label={t("increaseQuantityAria")}
                        disabled={!isStockValid || quantity >= maxStock}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    <Button
                      variant="outline"
                      className="rounded-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDeleteItem(item)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                    <Button
                      className="rounded-full bg-secondary hover:bg-secondary/90 text-white px-5"
                      onClick={() => void handleAddToCart(item)}
                      disabled={addItemToWishlistMutation.isPending || !isAddEnabled}
                    >
                      <ShoppingBag className="size-4" />
                      {t("addToCart")}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="col-span-12 xl:col-span-4 xl:sticky xl:top-6">
          <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t("orderSummary")}</h3>
              <Badge variant="outline" className="rounded-full">
                {selectedCount} {t("items")}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{t("selectedItems")}</span>
                <span>{selectedCount}</span>
              </div>
              <div className="flex items-center justify-between font-semibold text-base">
                <span>{t("total")}</span>
                <span className="text-secondary">
                  {formatCurrency(selectedTotal || total)}
                </span>
              </div>
            </div>

            <Button
              className="w-full h-11 rounded-full bg-secondary hover:bg-secondary/90 text-white"
              onClick={() => void handleAddSelectedToCart()}
              disabled={selectedCount === 0 || addItemToWishlistMutation.isPending}
            >
              {t("addSelectedToCart")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistTable;
