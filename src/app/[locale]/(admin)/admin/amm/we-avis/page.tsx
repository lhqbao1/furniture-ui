"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { useImportAmmProducts } from "@/features/amm/hook";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { ammWeAvisSchema, weAvisDefaultValues } from "@/lib/schema/amm-weavis";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useGetProductsSelect } from "@/features/product-group/hook";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import Image from "next/image";
import { Check } from "lucide-react";
import { ProductItem } from "@/types/products";
import { toast } from "sonner";

type FormItem = {
  product_id: string;
  quantity: number;
};

const AmmWeAvisPage = () => {
  const form = useForm<z.infer<typeof ammWeAvisSchema>>({
    resolver: zodResolver(ammWeAvisSchema),
    defaultValues: weAvisDefaultValues,
  });
  const items = form.watch("items");

  const addProductAsItem = (product: ProductItem) => {
    const exists = items?.some((i) => i.product_id === product.id);
    if (exists) return;

    form.setValue("items", [
      ...(items || []),
      {
        product_id: product.id,
        quantity: 1,
        position_number: 1,
        reference: product.sku,
        title: product.name,
        unit: "St",
      },
    ]);
    console.log(product);
  };

  const removeItem = (productId: string) => {
    form.setValue(
      "items",
      items.filter((i: any) => i.product_id !== productId),
    );
  };

  const importAmmProductMutation = useImportAmmProducts();
  function onSubmit(values: z.infer<typeof ammWeAvisSchema>) {
    if (!products) return;

    const payload = {
      kopfdaten: values.kopfdaten,
      items: values.items.map((item: any, index: number) => {
        const product = products.find((p) => p.id === item.product_id);

        return {
          position_number: index + 1,
          reference: product?.sku ?? "",
          title: product?.name ?? "",
          unit: "St",
          quantity: item.quantity,
        };
      }),
    };

    // 👉 show loading toast
    const toastId = toast.loading("Importing products...");

    importAmmProductMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Products imported successfully.", {
          id: toastId, // ✅ replace loading toast
        });
      },
      onError: () => {
        toast.error("Failed to import products.", {
          id: toastId, // ✅ replace loading toast
        });
      },
    });
  }

  const {
    data: products,
    isLoading,
    isError,
  } = useGetProductsSelect({
    all_products: true,
  });

  const orderedProducts = React.useMemo(() => {
    if (!products) return [];

    const selectedIds = new Set((items || []).map((i: any) => i.product_id));

    const selectedProducts = products.filter((p) => selectedIds.has(p.id));

    const unselectedProducts = products.filter((p) => !selectedIds.has(p.id));

    return [...selectedProducts, ...unselectedProducts];
  }, [products, items]);

  return (
    <Form {...form}>
      <h2 className="section-header mb-12">Import We Avis to AMM</h2>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className=""
      >
        <div className="grid grid-cols-3 gap-8">
          <FormField
            control={form.control}
            name="kopfdaten.client"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="kopfdaten.order_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="AZ000000"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="kopfdaten.supplier_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier ID</FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="kopfdaten.supplier_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="kopfdaten.supplier_city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier City</FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="kopfdaten.supplier_postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier Postal Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="shadcn"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="kopfdaten.supplier_country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier Country</FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="kopfdaten.delivery_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={
                      field.value
                        ? `${field.value.slice(0, 4)}-${field.value.slice(4, 6)}-${field.value.slice(6, 8)}`
                        : ""
                    }
                    onChange={(e) => {
                      const raw = e.target.value; // yyyy-mm-dd
                      const compact = raw.replace(/-/g, ""); // yyyymmdd
                      field.onChange(compact);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="kopfdaten.warehouse"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warehouse</FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem className="flex flex-col">
            <FormLabel>Products</FormLabel>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-between h-9"
                >
                  Add products
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[500px] p-0">
                <Command>
                  <CommandInput placeholder="Search products..." />
                  <CommandGroup className="max-h-[300px] overflow-y-auto">
                    {orderedProducts?.map((product) => {
                      const selected = items?.some(
                        (i: any) => i.product_id === product.id,
                      );

                      return (
                        <CommandItem
                          key={product.id}
                          onSelect={() => addProductAsItem(product)}
                          disabled={selected}
                          className="flex items-center gap-2"
                        >
                          <Check
                            className={`h-4 w-4 ${
                              selected ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          <div className="flex gap-2 items-center">
                            <Image
                              src={product.static_files?.[0]?.url ?? "/1.png"}
                              width={30}
                              height={30}
                              alt=""
                              className="object-contain"
                            />
                            <div>
                              <div>{product.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {product.sku}
                              </div>
                            </div>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </FormItem>

          {items?.length > 0 && (
            <div className="col-span-3 space-y-2">
              <div className="grid grid-cols-12 font-semibold text-sm border-b pb-1">
                <div className="col-span-5">Product</div>
                <div className="col-span-3">SKU</div>
                <div className="col-span-2">Unit</div>
                <div className="col-span-1">Qty</div>
                <div className="col-span-1"></div>
              </div>

              {items.map((item: any, index: number) => {
                const product = products?.find((p) => p.id === item.product_id);
                return (
                  <div
                    key={item.product_id}
                    className="grid grid-cols-12 items-center gap-2"
                  >
                    <div className="col-span-5">{product?.name}</div>
                    <div className="col-span-3">{product?.sku.toString()}</div>
                    <div className="col-span-2">St</div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          form.setValue(
                            `items.${index}.quantity`,
                            e.target.valueAsNumber,
                          )
                        }
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeItem(item.product_id)}
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <Button
          type="submit"
          className="mt-8 text-lg px-8 py-1.5"
        >
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default AmmWeAvisPage;
