"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useEditProduct } from "@/features/products/hook";
import { useSyncToEbay } from "@/features/ebay/hook";
import { useSyncToKaufland } from "@/features/kaufland/hook";
import { syncToEbayInput } from "@/features/ebay/api";
import { syncToKauflandInput } from "@/features/kaufland/api";
import { MarketplaceProduct, ProductItem } from "@/types/products";
import { calculateAvailableStock } from "@/hooks/calculate_available_stock";
import { stripHtmlRegex } from "@/hooks/simplifyHtml";
import { getMarketplaceSyncGuardErrors } from "@/lib/marketplace-sync-guards";
import { parseError } from "./sync-to-ebay-form";

type QuickSyncMarketplace = "ebay" | "kaufland";

interface QuickSyncOverrides {
  final_price?: number;
  handling_time?: number;
  max_stock?: number;
}

function useMarketplaceQuickSync() {
  const queryClient = useQueryClient();
  const updateProductMutation = useEditProduct();
  const syncToEbayMutation = useSyncToEbay();
  const syncToKauflandMutation = useSyncToKaufland();

  const isPending =
    updateProductMutation.isPending ||
    syncToEbayMutation.isPending ||
    syncToKauflandMutation.isPending;

  const submit = (
    product: ProductItem,
    marketplace: QuickSyncMarketplace,
    overrides: QuickSyncOverrides,
    callbacks: { onSuccess: () => void; onError: () => void },
  ) => {
    if (!product.brand) {
      toast.error("Brand is missing from current product");
      callbacks.onError();
      return;
    }

    const marketplaceRecord = product.marketplace_products?.find(
      (m) => m.marketplace === marketplace,
    );

    const normalizedValues: MarketplaceProduct = {
      marketplace,
      name: marketplaceRecord?.name ?? product.name,
      description: marketplaceRecord?.description ?? product.description,
      final_price:
        overrides.final_price ??
        marketplaceRecord?.final_price ??
        product.final_price ??
        0,
      min_stock: marketplaceRecord?.min_stock ?? 1,
      max_stock:
        overrides.max_stock ??
        marketplaceRecord?.max_stock ??
        calculateAvailableStock(product),
      current_stock: marketplaceRecord?.current_stock ?? 0,
      line_item_id: marketplaceRecord?.line_item_id ?? "",
      is_active: marketplaceRecord?.is_active ?? false,
      marketplace_offer_id: marketplaceRecord?.marketplace_offer_id ?? "",
      sku: product.sku ?? "",
      brand: product.brand ? product.brand.name : (marketplaceRecord?.brand ?? ""),
      handling_time: overrides.handling_time ?? marketplaceRecord?.handling_time ?? 0,
    };

    const updatedMarketplaceProducts = [...(product.marketplace_products || [])];
    const existingIndex = updatedMarketplaceProducts.findIndex(
      (m) => m.marketplace === marketplace,
    );

    if (existingIndex >= 0) {
      updatedMarketplaceProducts[existingIndex] = {
        ...updatedMarketplaceProducts[existingIndex],
        ...normalizedValues,
        is_active: updatedMarketplaceProducts[existingIndex].is_active,
        marketplace_offer_id:
          updatedMarketplaceProducts[existingIndex].marketplace_offer_id,
        line_item_id: updatedMarketplaceProducts[existingIndex].line_item_id,
        brand: updatedMarketplaceProducts[existingIndex].brand,
      };
    } else {
      updatedMarketplaceProducts.push(normalizedValues);
    }

    const validationErrors = getMarketplaceSyncGuardErrors(
      { ...product, marketplace_products: updatedMarketplaceProducts },
      marketplace,
    );

    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      callbacks.onError();
      return;
    }

    const toastDescription = (
      <div className="space-y-0.5">
        <div>Name: {product.name ?? "—"}</div>
        <div>EAN: {product.ean ?? "—"}</div>
        <div>SKU: {product.sku ?? "—"}</div>
      </div>
    );

    const loadingToastId = toast.loading("Syncing marketplace data...", {
      description: toastDescription,
    });

    const finalizeSuccess = () => {
      toast.success("Sync marketplace data success", { id: loadingToastId });
      queryClient.invalidateQueries({ queryKey: ["all-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", product.id] });
      callbacks.onSuccess();
    };

    const finalizeError = (message: string, description?: string) => {
      toast.error(message, { id: loadingToastId, description });
      callbacks.onError();
    };

    const {
      static_files,
      categories,
      marketplace_products,
      bundles,
      brand,
      ...productBase
    } = product;

    updateProductMutation.mutate(
      {
        input: {
          ...productBase,
          category_ids: categories.map((c) => c.id),
          marketplace_products: updatedMarketplaceProducts,
          static_files: static_files?.map((file) => ({ url: file.url })) ?? [],
          ...(bundles?.length
            ? {
                bundles: bundles.map((item) => ({
                  product_id: item.bundle_item.id,
                  quantity: item.quantity,
                })),
              }
            : { bundles: [] }),
          brand_id: brand ? brand.id : null,
        },
        id: product.id,
        skipInvalidateProducts: true,
      },
      {
        onSuccess(data) {
          const marketplaceData =
            data.marketplace_products?.find(
              (m: MarketplaceProduct) => m.marketplace === marketplace,
            ) ?? normalizedValues;
          const stock = marketplaceData.max_stock ?? calculateAvailableStock(product);

          if (marketplace === "ebay") {
            const payload: syncToEbayInput = {
              price: marketplaceData.final_price ?? product.final_price,
              sku: product.id_provider,
              stock,
              tax: product.tax ? product.tax : null,
              product: {
                description: stripHtmlRegex(
                  marketplaceData.description ?? product.description,
                ),
                title: marketplaceData.name ?? product.name,
                imageUrls:
                  product.static_files?.map((file) =>
                    file.url.replace(/\s+/g, "%20"),
                  ) ?? [],
                ean: product.ean ? [product.ean] : [],
              },
              carrier: product.carrier,
              brand: product.brand ? product.brand.name : "",
              ...(marketplaceData.min_stock !== undefined && {
                min_stock: marketplaceData.min_stock,
              }),
              ...(marketplaceData.max_stock !== undefined && {
                max_stock: marketplaceData.max_stock,
              }),
              manufacturer: {
                name: product.brand.company_name,
                address: product.brand.company_address,
                city: product.brand.company_city,
                country: product.brand.company_country,
                email: product.brand.company_email,
                postal_code: product.brand.company_postal_code,
                phone: product.brand.company_phone ?? "",
              },
              documents:
                product.pdf_files && product.pdf_files.length > 0
                  ? product.pdf_files
                  : null,
              ebay_offer_id: marketplaceData.marketplace_offer_id ?? null,
            };

            syncToEbayMutation.mutate(
              { ...payload, __silent: true },
              {
                onSuccess() {
                  finalizeSuccess();
                },
                onError(error) {
                  finalizeError("Failed to update marketplace data", error.message);
                },
              },
            );
            return;
          }

          const payload: syncToKauflandInput = {
            ean: product.ean,
            title: marketplaceData.name ?? product.name,
            description: marketplaceData.description ?? product.description,
            image_urls:
              product.static_files?.map((f) => f.url.replace(/\s+/g, "%20")) ?? [],
            price: marketplaceData.final_price ?? product.final_price,
            stock,
            carrier: product.carrier,
            sku: product.id_provider,
            product_id: product.id,
            ...(marketplaceData.min_stock !== undefined && {
              min_stock: marketplaceData.min_stock,
            }),
            ...(marketplaceData.max_stock !== undefined && {
              max_stock: marketplaceData.max_stock,
            }),
            marketplace_offer_id: marketplaceData.marketplace_offer_id,
            brand: {
              address: product.brand.company_address,
              email: product.brand.company_email,
              name: product.brand.name,
              phone: product.brand.company_phone ?? "",
            },
            handling_time: normalizedValues.handling_time ?? 0,
            material: product.materials,
            color: product.color,
            length: product.length || null,
            width: product.width || null,
            height: product.height || null,
            weight: product.weight || null,
          };

          syncToKauflandMutation.mutate(
            { ...payload, __silent: true },
            {
              onSuccess() {
                finalizeSuccess();
              },
              onError(error) {
                finalizeError("Failed to update marketplace data", error.message);
              },
            },
          );
        },
        onError(e) {
          finalizeError("Failed to update marketplace data", parseError(e));
        },
      },
    );
  };

  return { submit, isPending };
}

export function MarketplaceQuickPriceEdit({
  product,
  marketplace,
}: {
  product: ProductItem;
  marketplace: QuickSyncMarketplace;
}) {
  const { submit, isPending } = useMarketplaceQuickSync();
  const [editing, setEditing] = useState(false);
  const [priceInput, setPriceInput] = useState("");
  const [handlingTimeInput, setHandlingTimeInput] = useState("");
  const [stockInput, setStockInput] = useState("");

  const marketplaceRecord = product.marketplace_products?.find(
    (m) => m.marketplace === marketplace,
  );

  const displayPrice = marketplaceRecord?.final_price ?? product.final_price;

  const openEdit = () => {
    const priceDefault = marketplaceRecord?.final_price ?? product.final_price;
    setPriceInput(
      priceDefault !== undefined && priceDefault !== null ? String(priceDefault) : "",
    );
    setHandlingTimeInput(
      marketplaceRecord?.handling_time ? String(marketplaceRecord.handling_time) : "2",
    );
    setStockInput(
      marketplaceRecord?.max_stock !== undefined && marketplaceRecord?.max_stock !== null
        ? String(marketplaceRecord.max_stock)
        : String(calculateAvailableStock(product)),
    );
    setEditing(true);
  };

  const handleSubmit = () => {
    const overrides: QuickSyncOverrides = {};

    if (priceInput.trim() !== "") {
      const parsedPrice = Number(priceInput);
      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        toast.error("Invalid price");
        return;
      }
      overrides.final_price = parsedPrice;
    }

    if (marketplace === "kaufland") {
      const parsedHandlingTime = Number(handlingTimeInput);
      if (
        handlingTimeInput.trim() === "" ||
        Number.isNaN(parsedHandlingTime) ||
        parsedHandlingTime <= 0
      ) {
        toast.error("Invalid handling time");
        return;
      }
      overrides.handling_time = parsedHandlingTime;
    }

    if (stockInput.trim() !== "") {
      const parsedStock = Number(stockInput);
      if (Number.isNaN(parsedStock) || parsedStock < 0) {
        toast.error("Invalid stock");
        return;
      }
      overrides.max_stock = parsedStock;
    }

    submit(product, marketplace, overrides, {
      onSuccess: () => setEditing(false),
      onError: () => {},
    });
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={openEdit}
        className="text-[14px] text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
      >
        {displayPrice !== undefined && displayPrice !== null ? (
          `€${Number(displayPrice).toFixed(2)}`
        ) : (
          <span className="italic">Set price</span>
        )}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 items-start">
      <div className="flex flex-row items-center gap-1.5">
        <label className="text-[10px] font-medium text-muted-foreground w-20 shrink-0">
          Price
        </label>
        <Input
          type="number"
          step="0.01"
          min={0}
          autoFocus
          value={priceInput}
          disabled={isPending}
          onChange={(e) => setPriceInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") setEditing(false);
          }}
          className="h-7 w-24 text-xs"
        />
      </div>

      {marketplace === "kaufland" && (
        <div className="flex flex-row items-center gap-1.5">
          <label className="text-[10px] font-medium text-muted-foreground w-20 shrink-0">
            Handling_time
          </label>
          <Input
            type="number"
            min={1}
            value={handlingTimeInput}
            disabled={isPending}
            onChange={(e) => setHandlingTimeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") setEditing(false);
            }}
            className="h-7 w-24 text-xs"
          />
        </div>
      )}

      <div className="flex flex-row items-center gap-1.5">
        <label className="text-[10px] font-medium text-muted-foreground w-20 shrink-0">
          Stock
        </label>
        <Input
          type="number"
          min={0}
          value={stockInput}
          disabled={isPending}
          onChange={(e) => setStockInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") setEditing(false);
          }}
          className="h-7 w-24 text-xs"
        />
      </div>
    </div>
  );
}
