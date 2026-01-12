"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
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
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { ProductItem } from "@/types/products";
import { useGetAllProducts } from "@/features/products/hook";

interface SelectedProduct {
  product: ProductItem;
  quantity: number;
  final_price: number;
  carrier: string;
}

interface SelectOrderItemsProps {
  listProducts: SelectedProduct[];
  setListProducts: React.Dispatch<React.SetStateAction<SelectedProduct[]>>;
}

const SelectOrderItems = ({
  listProducts,
  setListProducts,
}: SelectOrderItemsProps) => {
  const form = useFormContext();
  const { setValue } = form;

  const [queryParams, setQueryParams] = useState("");
  const [open, setOpen] = useState(false);

  const {
    data: products,
    isLoading,
    isError,
  } = useGetAllProducts({
    search: queryParams,
    all_products: "true",
    page_size: 100,
  });

  const handleSelectProduct = (product: ProductItem) => {
    setListProducts((prev) => {
      if (prev.some((p) => p.product.id === product.id)) return prev;
      return [
        ...prev,
        {
          product,
          quantity: 1,
          final_price: product.final_price ?? 0,
          carrier: product.carrier,
        },
      ];
    });
  };

  const handleQuantityChange = (id: string, value: number) => {
    setListProducts((prev) =>
      prev.map((item) =>
        item.product.id === id ? { ...item, quantity: value } : item,
      ),
    );
  };

  const handlePriceChange = (id: string, value: number) => {
    setListProducts((prev) =>
      prev.map((item) =>
        item.product.id === id ? { ...item, final_price: value } : item,
      ),
    );
  };

  const handleRemoveProduct = (id: string) => {
    setListProducts((prev) => prev.filter((p) => p.product.id !== id));
  };

  const filteredProducts = useMemo(() => {
    if (!products?.items) return [];
    return products.items.filter(
      (p: ProductItem) => !listProducts.some((lp) => lp.product.id === p.id),
    );
  }, [products?.items, listProducts]);

  // 🔹 Auto update form.items khi listProducts thay đổi
  useEffect(() => {
    const items = listProducts.map((item) => ({
      id_provider: item.product.id_provider,
      quantity: item.quantity,
      title: item.product.name,
      sku: item.product.sku ?? "",
      final_price: item.final_price,
      carrier: item.carrier,
    }));
    setValue("items", items);
  }, [listProducts, setValue]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 items-center">
        <Popover
          open={open}
          onOpenChange={setOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 justify-between py-1 h-12"
            >
              Select Products
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[600px] p-0 pointer-events-auto">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search product..."
                value={queryParams}
                onValueChange={(value) => setQueryParams(value)}
              />
              <CommandEmpty>No product found.</CommandEmpty>
              <CommandGroup className="h-[400px] overflow-y-scroll">
                {isLoading && <CommandItem disabled>Loading...</CommandItem>}
                {isError && (
                  <CommandItem disabled>Error loading products</CommandItem>
                )}
                {filteredProducts.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.id ?? ""}
                    onSelect={() => handleSelectProduct(product)}
                    className="flex justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={
                          product.static_files?.[0]?.url ??
                          "/product-placeholder.png"
                        }
                        height={25}
                        width={25}
                        alt=""
                        className="rounded-sm"
                        unoptimized
                      />
                      <span>{product.name}</span>
                    </div>
                    <span>€{product.final_price}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Danh sách sản phẩm đã chọn */}
      {listProducts.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-6 gap-3 text-sm font-medium text-muted-foreground">
            <div className="col-span-3">Product</div>
            <div>Quantity</div>
            <div>Price (€)</div>
            <div></div>
          </div>

          {listProducts.map(({ product, quantity, final_price }) => (
            <div
              key={product.id}
              className="grid grid-cols-6 gap-3 items-center border rounded-md p-2"
            >
              <div className="flex items-center gap-3 col-span-3">
                <Image
                  src={
                    product.static_files?.[0]?.url ?? "/product-placeholder.png"
                  }
                  width={50}
                  height={50}
                  alt=""
                  className="rounded-sm !h-[40px] object-cover"
                  unoptimized
                />
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    #{product.id_provider}
                  </div>
                </div>
              </div>

              <Input
                type="number"
                min={0}
                step="0.01"
                value={quantity}
                onChange={(e) =>
                  handleQuantityChange(product.id, Number(e.target.value))
                }
              />

              <Input
                type="number"
                step="0.01"
                min={0}
                value={final_price}
                onChange={(e) =>
                  handlePriceChange(product.id, Number(e.target.value))
                }
              />

              <Button
                variant="ghost"
                onClick={() => handleRemoveProduct(product.id)}
              >
                <X className="text-red-400" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectOrderItems;
