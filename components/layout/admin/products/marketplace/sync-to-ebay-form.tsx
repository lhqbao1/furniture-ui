"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { error } from "console";

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
      final_price:
        product.marketplace_products.find(
          (i) => i.marketplace === currentMarketplace,
        )?.final_price ?? product.final_price,
      min_stock:
        product.marketplace_products.find(
          (i) => i.marketplace === currentMarketplace,
        )?.min_stock ?? 1,
      max_stock: product.stock - (product.result_stock ?? 0),
      sku: product.sku,
      handling_time:
        product.marketplace_products.find(
          (i) => i.marketplace === currentMarketplace,
        )?.handling_time ?? undefined,
    },
  });

  useEffect(() => {
    // Ensure min_stock is registered even when the input is hidden/omitted
    form.register("min_stock", { valueAsNumber: true });
    const currentMinStock = form.getValues("min_stock");
    if (currentMinStock === undefined || currentMinStock === null) {
      form.setValue("min_stock", 1, { shouldValidate: false });
    }
  }, [form]);

  const onSubmit = (values: MarketPlaceFormValues) => {
    let loadingToastId: string | number | undefined;

    if (!product.brand) {
      toast.error("Brand is missing from current product");
      return;
    }

    try {
      const selectedMarketplace =
        values.marketplace ?? currentMarketplace ?? "";

      if (!selectedMarketplace) {
        toast.error("Marketplace is missing");
        return;
      }

      if (
        selectedMarketplace !== "ebay" &&
        (!values.handling_time || values.handling_time === 0)
      ) {
        toast.error("Handling times is missing from current product");
        return;
      }

      const toastDescription = (
        <div className="space-y-0.5">
          <div>Name: {product.name ?? "—"}</div>
          <div>EAN: {product.ean ?? "—"}</div>
          <div>SKU: {product.sku ?? "—"}</div>
        </div>
      );
      loadingToastId = toast.loading("Syncing marketplace data...", {
        description: toastDescription,
      });

      setUpdating(true);
      setOpen(true);

      const normalizedValues: MarketplaceProduct = {
        ...values,
        marketplace: selectedMarketplace,
        final_price: values.final_price ?? 0,
        min_stock: values.min_stock ?? 1,
        max_stock: values.max_stock ?? 10,
        current_stock: values.current_stock ?? 0,
        line_item_id: values.line_item_id ?? "",
        is_active: values.is_active ?? false,
        marketplace_offer_id: values.marketplace_offer_id ?? "",
        name: values.name ?? "",
        description: values.description ?? "",
        sku: values.sku ?? product.sku ?? "",
        brand: product.brand ? product.brand.name : "",
        handling_time: values.handling_time ?? 0,
      };

      const updatedMarketplaceProducts = [
        ...(product.marketplace_products || []),
      ];

      // tìm đúng item theo marketplace
      const existing = updatedMarketplaceProducts.find(
        (m) => m.marketplace === selectedMarketplace,
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
            // is_active: true,
          });
        }
      } else {
        // ⭐ NOT updating → bật active hoặc tạo mới
        if (existing) {
          Object.assign(existing, {
            ...normalizedValues,
          });
        } else {
          updatedMarketplaceProducts.push({
            ...normalizedValues,
            // is_active: false,
          });
        }
      }

      const syncMarketplace = (
        marketplace: string,
        marketplaceData?: MarketplaceProduct,
      ) => {
        if (marketplace === "ebay") {
          const missingField = [
            { value: product.ean, label: "EAN" },
            { value: product.name, label: "Name" },
            { value: product.sku, label: "SKU" },
            { value: product.description, label: "Description" },
            {
              value: product.static_files && product.static_files.length > 0,
              label: "Images",
            },
            { value: product.final_price, label: "Final price" },
            { value: product.carrier, label: "Carrier" },
            { value: product.brand, label: "Brand" },
          ].find((field) => !field.value);

          if (missingField) {
            return toast.error(`Missing ${missingField.label}`, {
              id: loadingToastId,
            });
          }
          const payload: syncToEbayInput = {
            price: marketplaceData?.final_price ?? product.final_price,
            sku: product.id_provider,
            stock: values.max_stock ?? 0,
            tax: product.tax ? product.tax : null,
            product: {
              description: stripHtmlRegex(
                marketplaceData?.description ?? product.description,
              ),
              title: marketplaceData?.name ?? product.name,
              imageUrls:
                product.static_files?.map((file) =>
                  file.url.replace(/\s+/g, "%20"),
                ) ?? [],
              ean: product.ean ? [product.ean] : [],
            },
            carrier: product.carrier,
            brand: product.brand ? product.brand.name : "",
            ...(marketplaceData?.min_stock !== undefined && {
              min_stock: marketplaceData.min_stock,
            }),
            ...(marketplaceData?.max_stock !== undefined && {
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
            ebay_offer_id: marketplaceData?.marketplace_offer_id ?? null,
          };

          syncToEbayMutation.mutate(payload, {
            onSuccess() {
              toast.success("Sync marketplace data success", {
                id: loadingToastId,
              });
              setUpdating(false);
              setOpen(false);
            },
            onError(error) {
              toast.error("Failed to update marketplace data", {
                id: loadingToastId,
                description: error.message,
              });
              setUpdating(false);
            },
          });
        }

        if (marketplace === "kaufland") {
          const missingField = [
            { value: product.ean, label: "EAN" },
            { value: product.name, label: "Name" },
            { value: product.sku, label: "SKU" },
            { value: product.description, label: "Description" },
            {
              value: product.static_files && product.static_files.length > 0,
              label: "Images",
            },
            { value: product.final_price, label: "Final price" },
            { value: product.carrier, label: "Carrier" },
            { value: product.brand, label: "Brand" },
          ].find((field) => !field.value);

          if (missingField) {
            return toast.error(`Missing ${missingField.label}`, {
              id: loadingToastId,
            });
          }
          const payload: syncToKauflandInput = {
            ean: product.ean,
            title: marketplaceData?.name ?? product.name,
            description: marketplaceData?.description ?? product.description,
            image_urls:
              product.static_files?.map((f) => f.url.replace(/\s+/g, "%20")) ??
              [],
            price: marketplaceData?.final_price ?? product.final_price,
            stock: values.max_stock ?? 0,
            carrier: product.carrier,
            sku: product.id_provider,
            product_id: product.id,
            ...(marketplaceData?.min_stock !== undefined && {
              min_stock: marketplaceData.min_stock,
            }),
            ...(marketplaceData?.max_stock !== undefined && {
              max_stock: marketplaceData.max_stock,
            }),
            marketplace_offer_id: marketplaceData?.marketplace_offer_id,
            brand: {
              address: product.brand.company_address,
              email: product.brand.company_email,
              name: product.brand.name,
              phone: product.brand.company_phone ?? "",
            },
            handling_time: values.handling_time ?? 0,
          };

          syncToKauflandMutation.mutate(payload, {
            onSuccess() {
              toast.success("Sync marketplace data success", {
                id: loadingToastId,
              });
              setUpdating(false);
              setOpen(false);
            },
            onError(error) {
              console.log(error);
              toast.error("Failed to update marketplace data", {
                id: loadingToastId,
                description: error.message,
              });
              setUpdating(false);
            },
          });
        }
      };

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
            brand_id: product.brand ? product.brand.id : null,
          },

          id: product.id,
        },
        {
          onSuccess(data) {
            if (isUpdating || isAdd) {
              const marketplaceData = data.marketplace_products?.find(
                (m) => m.marketplace === selectedMarketplace,
              );
              syncMarketplace(
                selectedMarketplace,
                marketplaceData ?? normalizedValues,
              );
              return;
            }

            toast.success("Sync marketplace data success", {
              id: loadingToastId,
            });
            setUpdating(false);
            setOpen(false);
          },
          onError(e) {
            toast.error("Failed to update marketplace data", {
              id: loadingToastId,
              description: e.message,
            });
            setUpdating(false);
          },
        },
      );
    } catch (error) {
      console.error("SyncToEbayForm submit failed", error);
      toast.error("Submit failed", {
        id: loadingToastId,
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
      setUpdating(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
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
        <DialogContent className="w-250 overflow-y-scroll h-[calc(100%-3rem)]">
          <DialogHeader>
            <DialogTitle>Update Marketplace</DialogTitle>
          </DialogHeader>
          <div className="mx-auto space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit, (errors) => {
                  console.log("SyncToEbayForm submit errors", errors);
                  toast.error("Please check the form for errors");
                })}
                className="space-y-6"
              >
                {/* Submit */}
                <div className="flex justify-start">
                  <Button
                    type="submit"
                    className="px-6 py-2 text-lg"
                    disabled={
                      updateProductMutation.isPending ||
                      syncToEbayMutation.isPending ||
                      syncToKauflandMutation.isPending
                    }
                  >
                    {updateProductMutation.isPending ||
                    syncToEbayMutation.isPending ||
                    syncToKauflandMutation.isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : isUpdating ? (
                      "Update"
                    ) : (
                      "Add"
                    )}
                  </Button>
                </div>
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
                                  <SelectItem key={m} value={m}>
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
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {currentMarketplace !== "ebay" && (
                  <FormField
                    control={form.control}
                    name="handling_time"
                    render={({ field }) => (
                      <FormItem className="flex flex-col w-full">
                        <FormLabel className="text-black font-semibold text-sm">
                          Handling Time (days)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter handling time"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value),
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

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

                  {/* <FormField
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
                  /> */}

                  <FormField
                    control={form.control}
                    name="max_stock"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Stock</FormLabel>
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
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SyncToEbayForm;
