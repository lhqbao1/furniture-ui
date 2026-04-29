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
import { toast } from "sonner";
import { calculateProductVATFromNet } from "@/lib/caculate-vat";
import { getCountryCode } from "@/components/shared/getCountryNameDe";

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
  const priceMode = form.watch("price_mode") ?? "gross";
  const countryCode = getCountryCode(form.watch("country"));
  const taxId = form.watch("tax_id") ?? null;
  const effectiveTaxIdForVat =
    countryCode === "AT" ? "__AT_ZERO_VAT__" : taxId;

  const [queryParams, setQueryParams] = useState("");
  const [open, setOpen] = useState(false);

  const roundPrice = (value: number) => {
    const normalized = Number(value) || 0;
    return Number(normalized.toFixed(2));
  };

  const {
    data: products,
    isLoading,
    isError,
  } = useGetAllProducts({
    search: queryParams,
    page_size: 20,
  });

  const handleSelectProduct = (product: ProductItem) => {
    if (!product.carrier) {
      toast.error("Product must has carrier");
      return;
    }

    if (listProducts.some((p) => p.product.id === product.id)) {
      return;
    }

    setListProducts((prev) => {
      return [
        ...prev,
        {
          product,
          quantity: 1,
          final_price: roundPrice(Number(product.final_price) || 0),
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
        item.product.id === id
          ? { ...item, final_price: roundPrice(value) }
          : item,
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

  const formatCurrency = (value: number) =>
    value.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // 🔹 Auto update form.items khi listProducts thay đổi
  useEffect(() => {
    const items = listProducts.map((item) => ({
      id_provider: item.product.id_provider,
      quantity: item.quantity,
      title: item.product.name,
      sku: item.product.sku ?? "",
      final_price: roundPrice(item.final_price),
      carrier: item.carrier,
    }));
    setValue("items", items);
  }, [listProducts, setValue]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 items-center">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 justify-between py-1 h-12"
            >
              Select Products
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-150 p-0 pointer-events-auto">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search product..."
                value={queryParams}
                onValueChange={(value) => setQueryParams(value)}
              />
              <CommandEmpty>No product found.</CommandEmpty>
              <CommandGroup className="h-100 overflow-y-scroll">
                {isLoading && <CommandItem disabled>Loading...</CommandItem>}
                {isError && (
                  <CommandItem disabled>Error loading products</CommandItem>
                )}
                {filteredProducts.map((product) => (
                  (() => {
                    const hasPrice =
                      product.final_price !== null &&
                      product.final_price !== undefined &&
                      !Number.isNaN(Number(product.final_price));
                    const priceLabel = hasPrice
                      ? `€${formatCurrency(Number(product.final_price))}`
                      : "No price";

                    return (
                  <CommandItem
                    key={product.id}
                    value={product.id ?? ""}
                    onSelect={() => handleSelectProduct(product)}
                    className="flex items-center gap-3"
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
                      <div className="min-w-0">
                        <p className="truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ID: {product.id_provider ?? "-"} | SKU:{" "}
                          {product.sku?.trim() ? product.sku : "-"} |{" "}
                          {priceLabel}
                        </p>
                      </div>
                    </div>
                  </CommandItem>
                    );
                  })()
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

          {listProducts.map(({ product, quantity, final_price }) => {
            const grossPreview =
              priceMode === "net"
                ? calculateProductVATFromNet(
                    Number(final_price) || 0,
                    product?.tax ?? null,
                    countryCode,
                    effectiveTaxIdForVat,
                  ).gross
                : null;

            return (
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

                <div>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={roundPrice(final_price)}
                    onChange={(e) =>
                      handlePriceChange(product.id, Number(e.target.value))
                    }
                  />
                  {priceMode === "net" && (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Gross: € {formatCurrency(Number(grossPreview) || 0)}
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  onClick={() => handleRemoveProduct(product.id)}
                >
                  <X className="text-red-400" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SelectOrderItems;
