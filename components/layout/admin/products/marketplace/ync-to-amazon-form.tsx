"use client";

import React, { useMemo, useState, useEffect } from "react";
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
import { amazonMarketplaceSchema } from "@/lib/schema/product";
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
import RichEditor from "@/components/shared/tiptap/tiptap-editor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useSyncToAmazon } from "@/features/amazon/hook";
import { SyncToAmazonInput } from "@/features/amazon/api";
import { COUNTRY_ORIGIN_OPTIONS } from "@/data/data";

interface SyncToAmazonFormProps {
  product: ProductItem;
  isUpdating?: boolean;
  currentMarketplace?: string;
  updating?: boolean;
  isActive: boolean;
  setUpdating: React.Dispatch<React.SetStateAction<boolean>>;
  isAdd?: boolean;
}

type MarketPlaceFormValues = z.infer<typeof amazonMarketplaceSchema>;

const SyncToAmazonForm = ({
  product,
  isUpdating = false,
  currentMarketplace,
  updating,
  isActive,
  setUpdating,
  isAdd,
}: SyncToAmazonFormProps) => {
  const updateProductMutation = useEditProduct();
  const syncToAmazonMutation = useSyncToAmazon();

  const [open, setOpen] = useState<boolean>(false);
  const marketplaceLabel =
    (currentMarketplace ?? "")
      ? `${currentMarketplace[0].toUpperCase()}${currentMarketplace.slice(1)}`
      : "Marketplace";

  const defaultValues = useMemo(
    () => ({
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
      sku: product.id_provider,
      is_active: product.marketplace_products.find(
        (i) => i.marketplace === currentMarketplace,
      )?.is_active,
      country_of_origin: product.marketplace_products.find(
        (i) => i.marketplace === currentMarketplace,
      )?.country_of_origin,
      handling_time:
        product.marketplace_products.find(
          (i) => i.marketplace === currentMarketplace,
        )?.handling_time ?? undefined,
    }),
    [product, currentMarketplace],
  );

  const form = useForm<MarketPlaceFormValues>({
    resolver: zodResolver(amazonMarketplaceSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [form, defaultValues]);

  const handleSubmit = (values: MarketPlaceFormValues) => {
    if (!product.brand) {
      toast.error("Brand is missing from current product");
      return;
    }

    const selectedMarketplace = values.marketplace ?? currentMarketplace ?? "";

    if (!selectedMarketplace) {
      toast.error("Marketplace is missing");
      return;
    }

    if (!values.handling_time || values.handling_time === 0) {
      toast.error("Handling times is missing from current product");
      return;
    }

    setUpdating(true);
    setOpen(true);
    const normalizedValues: MarketplaceProduct = {
      ...values,
      marketplace: selectedMarketplace,
      final_price: values.final_price ?? 0,
      min_stock: values.min_stock ?? 0,
      max_stock: values.max_stock ?? 10,
      current_stock: values.current_stock ?? 0,
      line_item_id: values.line_item_id ?? "",
      is_active:
        product.marketplace_products.find(
          (i) => i.marketplace === currentMarketplace,
        )?.is_active ?? true,
      marketplace_offer_id: values.marketplace_offer_id ?? "",
      name: values.name ?? "",
      description: values.description ?? "",
      sku: product.id_provider ?? "",
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
        });
      } else {
        updatedMarketplaceProducts.push({
          ...normalizedValues,
          is_active: false,
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
          brand_id: product.brand ? product.brand.id : null,
        },

        id: product.id,
      },
      {
        onSuccess(data) {
          if (isUpdating || isAdd) {
            const missingField = [
              { value: product.ean, label: "EAN" },
              { value: product.name, label: "Name" },
              { value: product.sku, label: "SKU" },
              { value: product.description, label: "Description" },
              {
                value: product.static_files && product.static_files.length > 0,
                label: "Images",
              },
              {
                value: product.packages && product.packages.length > 0,
                label: "Packages information",
              },
              { value: product.final_price, label: "Final price" },
              { value: product.carrier, label: "Carrier" },
              { value: product.brand, label: "Brand" },
              { value: product.length, label: "Length" },
              { value: product.width, label: "Width" },
              { value: product.height, label: "Height" },
              { value: product.weight, label: "Net Weight" },
            ].find((field) => !field.value);

            if (missingField) {
              return toast.error(`Missing ${missingField.label}`);
            }
            const amazonData = data.marketplace_products?.find(
              (m) => m.marketplace === "amazon",
            );

            const payload: SyncToAmazonInput = {
              sku: amazonData?.sku ?? product.id_provider,
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
              package_length: Math.max(
                ...product.packages.map((p) => p.length ?? 0),
              ),
              package_height: Math.max(
                ...product.packages.map((p) => p.height ?? 0),
              ),
              package_width: Math.max(
                ...product.packages.map((p) => p.width ?? 0),
              ),
              color: product.color ?? "",
              unit_count: Number(product.amount_unit ?? 0),
              unit_count_type: product.unit,
              depth: 0,
              asin: null,
              stock: values.max_stock ?? 0,
              carrier: product.carrier,
              brand: product.brand ? product.brand.name : "",
              images: product.static_files?.map((f) => f.url) ?? [],
              model_number: product.sku,
              size: `${product.length}x${product.width}x${product.height}`,
              country_of_origin: values.country_of_origin,
              min_stock: values.min_stock ?? 0,
              max_stock: values.max_stock ?? 10,
              handling_time: values.handling_time ?? 0,
              bullet_point1: product.bullet_point_1 ?? null,
              bullet_point2: product.bullet_point_2 ?? null,
              bullet_point3: product.bullet_point_3 ?? null,
              bullet_point4: product.bullet_point_4 ?? null,
              bullet_point5: product.bullet_point_5 ?? null,
            };

            syncToAmazonMutation.mutate(payload, {
              onError(error) {
                toast.error("Failed to update marketplace data", {
                  description: error.message,
                });
              },
            });
          }
        },
        onError(e) {
          toast.error("Failed to update marketplace data", {
            description: e.message,
          });
        },
      },
    );
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
        <DialogContent className="w-[1000px] overflow-y-scroll h-[calc(100%-3rem)]">
          <DialogHeader>
            <DialogTitle>Update {marketplaceLabel}</DialogTitle>
            {isUpdating}
          </DialogHeader>
          <div className="mx-auto space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(
                  (values) => {
                    handleSubmit(values);
                  },
                  (errors) => {
                    console.log(errors);
                    toast.error("Please check the form for errors");
                  },
                )}
                className="space-y-6"
              >
                <div className="flex justify-start">
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="country_of_origin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country of Origin</FormLabel>

                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger
                              className="w-full border"
                              placeholderColor
                            >
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>

                            <SelectContent className="max-h-80">
                              {COUNTRY_ORIGIN_OPTIONS.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                  {c.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                </div>

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
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SyncToAmazonForm;
