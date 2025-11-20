"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { email, z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { marketPlaceSchema } from "@/lib/schema/product";
import { MarketplaceProduct, ProductItem } from "@/types/products";
import { useEditProduct } from "@/features/products/hook";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Pencil, Plus, RefreshCw } from "lucide-react";
import { useSyncToEbay } from "@/features/ebay/hook";
import { syncToEbayInput } from "@/features/ebay/api";
import { stripHtmlRegex } from "@/hooks/simplifyHtml";
import RichEditor from "@/components/shared/tiptap/tiptap-editor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { syncToKauflandInput } from "@/features/kaufland/api";
import { useSyncToKaufland } from "@/features/kaufland/hook";

interface SyncToEbayFormProps {
  product: ProductItem;
  isUpdating?: boolean;
  currentMarketplace?: string;
  updating?: boolean;
  setUpdating: React.Dispatch<React.SetStateAction<boolean>>;
  isAdd?: boolean;
}

type MarketPlaceFormValues = z.infer<typeof marketPlaceSchema>;

const SyncToEbayForm = ({
  product,
  isUpdating = false,
  currentMarketplace,
  updating,
  setUpdating,
  isAdd,
}: SyncToEbayFormProps) => {
  const updateProductMutation = useEditProduct();
  const syncToEbayMutation = useSyncToEbay();
  const syncToKauflandMutation = useSyncToKaufland();

  const [open, setOpen] = useState<boolean>(false);
  // Danh sách marketplace khả dụng
  const ALL_MARKETPLACES = ["ebay", "amazon", "kaufland"];

  const existingMarketplaces = useMemo(
    () => product.marketplace_products?.map((m) => m.marketplace) ?? [],
    [product],
  );

  const availableMarketplaces = useMemo(
    () => ALL_MARKETPLACES.filter((m) => !existingMarketplaces.includes(m)),
    [existingMarketplaces],
  );

  const marketplacesToRender = useMemo(
    () => (isUpdating ? ALL_MARKETPLACES : availableMarketplaces),
    [isUpdating, availableMarketplaces],
  );

  const form = useForm<MarketPlaceFormValues>({
    resolver: zodResolver(marketPlaceSchema),
    defaultValues: {
      marketplace: currentMarketplace ?? "",
      name: product.name,
      description: product.description,
      final_price: isUpdating
        ? product.marketplace_products.find(
            (i) => i.marketplace === currentMarketplace,
          )?.final_price
        : product.final_price,
      min_stock: isUpdating
        ? product.marketplace_products.find(
            (i) => i.marketplace === currentMarketplace,
          )?.min_stock
        : undefined,
      max_stock: isUpdating
        ? product.marketplace_products.find(
            (i) => i.marketplace === currentMarketplace,
          )?.max_stock
        : undefined,
      sku: product.sku,
    },
  });

  const marketplace = form.watch("marketplace");

  useEffect(() => {
    if (isUpdating) return;
    if (marketplace === "ebay") {
      form.setValue("min_stock", 0);
      form.setValue("max_stock", 10);
    } else {
      form.setValue("min_stock", null);
      form.setValue("max_stock", null);
    }
  }, [marketplace, form]);

  const onSubmit = (values: MarketPlaceFormValues) => {
    if (!product.brand) {
      toast.error("Brand is missing from current product");
      return;
    }

    setUpdating(true);
    setOpen(true);
    const normalizedValues: MarketplaceProduct = {
      ...values,
      marketplace: values.marketplace ?? "",
      final_price: values.final_price ?? 0,
      min_stock: values.min_stock ?? 0,
      max_stock: values.max_stock ?? 0,
      current_stock: values.current_stock ?? 0,
      line_item_id: values.line_item_id ?? "",
      is_active: values.is_active ?? false,
      marketplace_offer_id: values.marketplace_offer_id ?? "",
      name: values.name ?? "",
      description: values.description ?? "",
      sku: values.sku ?? "",
      brand: product.brand ? product.brand.name : "",
    };

    const updatedMarketplaceProducts = [
      ...(product.marketplace_products || []),
    ];

    // tìm đúng item theo marketplace
    const existing = updatedMarketplaceProducts.find(
      (m) => m.marketplace === values.marketplace,
    );

    if (isUpdating) {
      if (existing) {
        // ⭐ Update item cũ, giữ lại một số field quan trọng
        Object.assign(existing, {
          ...normalizedValues,
          is_active: existing.is_active, // giữ nguyên
          marketplace_offer_id: existing.marketplace_offer_id,
          line_item_id: existing.line_item_id,
          brand: existing.brand,
        });
      } else {
        // ⭐ Không tồn tại → thêm mới
        updatedMarketplaceProducts.push({
          ...normalizedValues,
          is_active: true,
        });
      }
    } else {
      // ⭐ NOT updating → bật active hoặc tạo mới
      if (existing) {
        Object.assign(existing, {
          ...normalizedValues,
          is_active: true, // bật active
        });
      } else {
        updatedMarketplaceProducts.push({
          ...normalizedValues,
          is_active: true,
        });
      }
    }

    updateProductMutation.mutate(
      {
        input: {
          ...product,
          category_ids: product.categories.map((c) => c.id),
          marketplace_products: updatedMarketplaceProducts,
          ...(product.bundles?.length
            ? {
                bundles: product.bundles.map((item) => ({
                  product_id: item.bundle_item.id,
                  quantity: item.quantity,
                })),
              }
            : { bundles: [] }),
          brand_id: product.brand.id,
        },

        id: product.id,
      },
      {
        onSuccess(data) {
          if ((isUpdating || isAdd) && currentMarketplace === "ebay") {
            const ebayData = data.marketplace_products?.find(
              (m) => m.marketplace === "ebay",
            );
            const payload: syncToEbayInput = {
              price: ebayData?.final_price ?? product.final_price,
              sku: ebayData?.sku ?? product.sku,
              stock: product.stock,
              tax: product.tax ? product.tax : null,
              product: {
                description: stripHtmlRegex(
                  ebayData?.description ?? product.description,
                ),
                title: ebayData?.name ?? product.name,
                imageUrls:
                  product.static_files?.map((file) =>
                    file.url.replace(/\s+/g, "%20"),
                  ) ?? [],
                ean: product.ean ? [product.ean] : [],
              },
              carrier: product.carrier,
              brand: product.brand ? product.brand.name : "",
              ...(ebayData?.min_stock !== undefined && {
                min_stock: ebayData.min_stock,
              }),
              ...(ebayData?.max_stock !== undefined && {
                max_stock: ebayData.max_stock,
              }),
            };

            syncToEbayMutation.mutate(payload);
          }

          if ((isUpdating || isAdd) && currentMarketplace === "kaufland") {
            const kauflandData = data.marketplace_products?.find(
              (m) => m.marketplace === "kaufland",
            );
            const payload: syncToKauflandInput = {
              ean: product.ean,
              title: kauflandData?.name ?? product.name,
              description: kauflandData?.description ?? product.description,
              image_urls:
                product.static_files?.map((f) =>
                  f.url.replace(/\s+/g, "%20"),
                ) ?? [],
              price: kauflandData?.final_price ?? product.final_price,
              stock: product.stock,
              carrier: product.carrier,
              sku: product.sku,
              product_id: product.id,
              ...(kauflandData?.min_stock !== undefined && {
                min_stock: kauflandData.min_stock,
              }),
              ...(kauflandData?.max_stock !== undefined && {
                max_stock: kauflandData.max_stock,
              }),
              marketplace_offer_id: kauflandData?.marketplace_offer_id,
              brand: {
                address: product.brand.company_address,
                email: product.brand.company_email,
                name: product.brand.company_name,
              },
            };

            // Hiển thị toast loading
            syncToKauflandMutation.mutate(payload);
          }
        },
        onError() {
          toast.error("Failed to update marketplace data");
        },
      },
    );
    console.log(updatedMarketplaceProducts);
    console.log(normalizedValues);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogTrigger asChild>
          <Button
            variant="outline"
            type="button"
            className={`${
              isUpdating
                ? "bg-amber-50 border-amber-400"
                : "bg-green-50 border-green-400"
            }`}
          >
            {isUpdating ? (
              <Pencil className="text-amber-400" />
            ) : isAdd ? (
              <RefreshCw className="text-green-400" />
            ) : (
              <Plus className="text-green-400" />
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[1000px] overflow-y-scroll h-[calc(100%-3rem)]">
          <DialogHeader>
            <DialogTitle>Update Marketplace</DialogTitle>
          </DialogHeader>
          <div className="mx-auto space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Marketplace */}
                {isUpdating || isAdd ? (
                  ""
                ) : (
                  <FormField
                    control={form.control}
                    name="marketplace"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel>Marketplace</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger className="border">
                                <SelectValue placeholder="Select a marketplace" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {marketplacesToRender.length > 0 ? (
                                marketplacesToRender.map((m) => (
                                  <SelectItem
                                    key={m}
                                    value={m}
                                  >
                                    {m.toUpperCase()}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                  All marketplaces added
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                )}

                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter product name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price + Stock */}
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="final_price"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Final Price (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min={0}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? null
                                  : e.target.valueAsNumber,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="min_stock"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Min Stock</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? null
                                  : e.target.valueAsNumber,
                              )
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_stock"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Max Stock</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? null
                                  : e.target.valueAsNumber,
                              )
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black font-semibold text-sm">
                        Description
                      </FormLabel>
                      <FormControl>
                        <RichEditor
                          disabled
                          value={field.value || ""}
                          onChangeValue={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="px-6 py-2 text-lg"
                    disabled={
                      isUpdating
                        ? syncToEbayMutation.isPending
                        : updateProductMutation.isPending
                    }
                  >
                    {isUpdating ? (
                      syncToEbayMutation.isPending ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Update"
                      )
                    ) : updateProductMutation.isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Add"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SyncToEbayForm;
