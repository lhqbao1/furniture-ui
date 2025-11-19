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
import { Loader2, Pencil } from "lucide-react";
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
import { useSyncToAmazon } from "@/features/amazon/hook";
import { SyncToAmazonInput } from "@/features/amazon/api";

interface SyncToAmazonFormProps {
  product: ProductItem;
  isUpdating?: boolean;
  currentMarketplace?: string;
  updating?: boolean;
  isActive: boolean;
  setUpdating: React.Dispatch<React.SetStateAction<boolean>>;
}

type MarketPlaceFormValues = z.infer<typeof marketPlaceSchema>;

const SyncToAmazonForm = ({
  product,
  isUpdating = false,
  currentMarketplace,
  updating,
  isActive,
  setUpdating,
}: SyncToAmazonFormProps) => {
  const updateProductMutation = useEditProduct();
  const syncToAmazonMutation = useSyncToAmazon();

  const [open, setOpen] = useState<boolean>(false);

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
      max_stock: values.max_stock ?? 10,
      current_stock: values.current_stock ?? 0,
      line_item_id: values.line_item_id ?? "",
      is_active: values.is_active ?? true,
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
        // update item cũ, preserve một số field
        Object.assign(existing, {
          ...normalizedValues,
          is_active: existing.is_active,
          marketplace_offer_id: existing.marketplace_offer_id,
          line_item_id: existing.line_item_id,
          brand: existing.brand,
        });
      } else {
        // không tìm thấy → push mới
        updatedMarketplaceProducts.push({
          ...normalizedValues,
          is_active: true,
        });
      }
    } else {
      // NOT updating → bật active hoặc tạo mới
      if (existing) {
        Object.assign(existing, {
          ...normalizedValues,
          is_active: true,
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
          const amazonData = data.marketplace_products?.find(
            (m) => m.marketplace === "amazon",
          );
          const payload: SyncToAmazonInput = {
            sku: amazonData?.sku ?? product.sku,
            title: amazonData?.name ?? product.name,
            manufacturer: product.brand ? product.brand.company_name : "",
            description: amazonData?.description ?? product.description,
            price: amazonData?.final_price ?? product.final_price,
            ean: product.ean,
            part_number: product.sku,
            is_fragile: false,
            number_of_items: Number(product.amount_unit) || 0,
            included_components: product.name,
            weight: product.weight,
            height: product.height,
            width: product.width,
            length: product.length,
            depth: 0,
            asin: null,
            stock: product.stock,
            carrier: product.carrier,
            brand: product.brand ? product.brand.name : "",
            images: product.static_files?.map((f) => f.url) ?? [],
            model_number: product.sku,
            size: `${product.length}x${product.width}x${product.height}`,
            country_of_origin: product.manufacture_country,
          };

          syncToAmazonMutation.mutate(payload);
        },
        onError() {
          toast.error("Failed to update marketplace data");
        },
      },
    );
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
                : "bg-white border-gray-500"
            }`}
          >
            {isUpdating ? <Pencil className="text-amber-400" /> : "Sync"}
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[1000px] overflow-y-scroll h-[calc(100%-3rem)]">
          <DialogHeader>
            <DialogTitle>Update Marketplace</DialogTitle>
            {isUpdating}
          </DialogHeader>
          <div className="mx-auto space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
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
                        ? syncToAmazonMutation.isPending
                        : updateProductMutation.isPending
                    }
                  >
                    {isUpdating ? (
                      syncToAmazonMutation.isPending ? (
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

export default SyncToAmazonForm;
