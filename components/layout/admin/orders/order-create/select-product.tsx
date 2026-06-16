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
import {
  calculateProductVAT,
  calculateProductVATFromNet,
  calculateShippingGrossFromNet,
} from "@/lib/caculate-vat";
import { getCountryCode } from "@/components/shared/getCountryNameDe";

interface SelectedProduct {
  product: ProductItem;
  quantity: number;
  final_price: number;
  bader_id?: string | null;
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
  const totalShippingInput = Number(form.watch("total_shipping") ?? 0) || 0;
  const fromMarketplace = String(form.watch("from_marketplace") ?? "").toLowerCase();
  const countryCode = getCountryCode(form.watch("invoice_country"));
  const taxId = form.watch("tax_id") ?? null;
  const effectiveTaxIdForVat =
    countryCode === "AT" ? "__AT_ZERO_VAT__" : taxId;
  const shouldShowBaderId =
    fromMarketplace === "bader" && listProducts.length >= 2;

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
          bader_id: null,
          carrier: product.carrier,
        },
      ];
    });
  };

  const handleQuantityChange = (id: string, value: number) => {
    const nextQuantity = Number.isFinite(value)
      ? Math.max(1, Math.floor(value))
      : 1;

    setListProducts((prev) =>
      prev.map((item) =>
        item.product.id === id
          ? { ...item, quantity: nextQuantity }
          : item,
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

  const handleBaderIdChange = (id: string, value: string) => {
    setListProducts((prev) =>
      prev.map((item) =>
        item.product.id === id ? { ...item, bader_id: value } : item,
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

  const productTotals = useMemo(() => {
    const totals = listProducts.reduce(
      (totals, item) => {
        const quantity = Math.max(0, Math.floor(Number(item.quantity) || 0));
        const unitPrice = Number(item.final_price) || 0;

        if (quantity <= 0 || unitPrice <= 0) return totals;

        if (priceMode === "net") {
          const vatInfo = calculateProductVATFromNet(
            unitPrice,
            item.product?.tax ?? null,
            countryCode,
            effectiveTaxIdForVat,
          );

          return {
            gross: totals.gross + (Number(vatInfo.gross) || 0) * quantity,
            net: totals.net + unitPrice * quantity,
            validItems: totals.validItems + 1,
          };
        }

        const vatInfo = calculateProductVAT(
          unitPrice,
          item.product?.tax ?? null,
          countryCode,
          effectiveTaxIdForVat,
        );

        return {
          gross: totals.gross + unitPrice * quantity,
          net: totals.net + (Number(vatInfo.net) || 0) * quantity,
          validItems: totals.validItems + 1,
        };
      },
      {
        gross: 0,
        net: 0,
        validItems: 0,
      },
    );

    const shippingInput = Math.max(0, Number(totalShippingInput) || 0);
    if (shippingInput <= 0) return totals;

    if (priceMode === "net") {
      const convertedShipping = calculateShippingGrossFromNet(
        listProducts.map((item) => ({
          unitNet: Number(item.final_price) || 0,
          quantity: Number(item.quantity) || 0,
          tax: item.product?.tax ?? null,
        })),
        shippingInput,
        countryCode,
        effectiveTaxIdForVat,
      );

      return {
        ...totals,
        gross: totals.gross + (Number(convertedShipping.gross) || 0),
        net: totals.net + shippingInput,
      };
    }

    const shippingVatInfo = calculateProductVAT(
      shippingInput,
      "19%",
      countryCode,
      effectiveTaxIdForVat,
    );

    return {
      ...totals,
      gross: totals.gross + shippingInput,
      net: totals.net + (Number(shippingVatInfo.net) || 0),
    };
  }, [
    countryCode,
    effectiveTaxIdForVat,
    listProducts,
    priceMode,
    totalShippingInput,
  ]);

  // 🔹 Auto update form.items khi listProducts thay đổi
  useEffect(() => {
    const shouldSendBaderId =
      fromMarketplace === "bader" && listProducts.length >= 2;
    const items = listProducts.map((item) => ({
      id_provider: item.product.id_provider,
      quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
      title: item.product.name,
      sku: item.product.sku ?? "",
      final_price: roundPrice(item.final_price),
      bader_id: shouldSendBaderId ? (item.bader_id?.trim() ?? null) : null,
      carrier: item.carrier,
    }));
    setValue("items", items);
  }, [fromMarketplace, listProducts, setValue]);

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
          <div
            className={`grid ${shouldShowBaderId ? "grid-cols-7" : "grid-cols-6"} gap-3 text-sm font-medium text-muted-foreground`}
          >
            <div className={shouldShowBaderId ? "col-span-2" : "col-span-3"}>
              Product
            </div>
            <div>Quantity</div>
            <div>Price (€)</div>
            {shouldShowBaderId && <div>Bader ID</div>}
            <div></div>
          </div>

          {listProducts.map(({ product, quantity, final_price, bader_id }) => {
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
                className={`grid ${shouldShowBaderId ? "grid-cols-7" : "grid-cols-6"} gap-3 items-center border rounded-md p-2`}
              >
                <div
                  className={`flex items-center gap-3 ${shouldShowBaderId ? "col-span-2" : "col-span-3"}`}
                >
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
                  min={1}
                  step={1}
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

                {shouldShowBaderId && (
                  <Input
                    type="text"
                    placeholder="Bader ID"
                    value={bader_id ?? ""}
                    onChange={(e) =>
                      handleBaderIdChange(product.id, e.target.value)
                    }
                  />
                )}

                <Button
                  variant="ghost"
                  onClick={() => handleRemoveProduct(product.id)}
                >
                  <X className="text-red-400" />
                </Button>
              </div>
            );
          })}

          {productTotals.validItems > 0 && (
            <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Order totals
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Includes products and shipping, calculated from{" "}
                    {priceMode === "net" ? "net" : "gross"} prices.
                  </div>
                </div>
                <div className="rounded-full border border-secondary/20 bg-white px-3 py-1 text-xs font-medium text-secondary">
                  {productTotals.validItems} item
                  {productTotals.validItems > 1 ? "s" : ""}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Gross total
                  </div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">
                    € {formatCurrency(productTotals.gross)}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Net total
                  </div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">
                    € {formatCurrency(productTotals.net)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectOrderItems;
