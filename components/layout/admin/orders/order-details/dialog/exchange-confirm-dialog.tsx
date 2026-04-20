"use client";

import React, { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useCreateDeliveryOrder } from "@/features/checkout/hook";
import { useGetAllProducts } from "@/features/products/hook";
import { CARRIERS } from "@/data/data";
import { ProductItem } from "@/types/products";

interface ExchangeConfirmDialogProps {
  id: string;
  status: string;
  open: boolean;
  onClose: () => void;
}

interface SelectedProduct {
  product: ProductItem;
  quantity: number;
}

const formatCurrency = (value: number) =>
  value.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const hasValidPrice = (value: unknown) =>
  value !== null && value !== undefined && !Number.isNaN(Number(value));

const normalizeCarrierValue = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const resolveCarrierLabel = (carrierId: string) => {
  if (carrierId === "spedition") return "Spedition";
  if (carrierId === "amm") return "AMM";
  return carrierId.toUpperCase();
};

const ExchangeConfirmDialog = ({
  id,
  open,
  onClose,
}: ExchangeConfirmDialogProps) => {
  const exchangeOrderMutation = useCreateDeliveryOrder();

  const [openProductPopover, setOpenProductPopover] = useState(false);
  const [queryParams, setQueryParams] = useState("");
  const [listProducts, setListProducts] = useState<SelectedProduct[]>([]);
  const [carrier, setCarrier] = useState("");

  const {
    data: products,
    isLoading,
    isError,
  } = useGetAllProducts({
    search: queryParams,
    page_size: 20,
  });

  const carrierOptions = useMemo(
    () =>
      CARRIERS.map((carrierItem) => ({
        id: carrierItem.id,
        label: resolveCarrierLabel(carrierItem.id),
        logo: carrierItem.logo,
      })),
    [],
  );

  const resetFormState = useCallback(() => {
    setOpenProductPopover(false);
    setQueryParams("");
    setListProducts([]);
    setCarrier("");
  }, []);

  const handleCloseDrawer = useCallback(() => {
    resetFormState();
    onClose();
  }, [onClose, resetFormState]);

  const setDefaultCarrierFromProduct = useCallback(
    (product: ProductItem) => {
      const carrierFromProduct = normalizeCarrierValue(product.carrier);
      if (!carrierFromProduct) return;

      const matchedCarrier = carrierOptions.find(
        (carrierItem) =>
          normalizeCarrierValue(carrierItem.id) === carrierFromProduct ||
          normalizeCarrierValue(carrierItem.label) === carrierFromProduct,
      );

      if (matchedCarrier) {
        setCarrier(matchedCarrier.id);
      }
    },
    [carrierOptions],
  );

  const handleSelectProduct = useCallback(
    (product: ProductItem) => {
      setListProducts((prev) => {
        if (prev.some((selected) => selected.product.id === product.id)) {
          return prev;
        }

        return [...prev, { product, quantity: 1 }];
      });

      setDefaultCarrierFromProduct(product);
      setOpenProductPopover(false);
    },
    [setDefaultCarrierFromProduct],
  );

  const handleQuantityChange = (productId: string, value: number) => {
    setListProducts((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: value } : item,
      ),
    );
  };

  const handleRemoveProduct = (productId: string) => {
    setListProducts((prev) =>
      prev.filter((item) => item.product.id !== productId),
    );
  };

  const filteredProducts = useMemo(() => {
    if (!products?.items) return [];

    return products.items.filter(
      (product: ProductItem) =>
        !listProducts.some((selected) => selected.product.id === product.id),
    );
  }, [products?.items, listProducts]);

  const handleExchange = () => {
    if (!listProducts.length) {
      toast.error("Please select at least one product");
      return;
    }

    if (!carrier) {
      toast.error("Carrier is required");
      return;
    }

    exchangeOrderMutation.mutate(
      {
        main_checkout_id: id,
        payload: {
          carrier,
          items: listProducts.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
          })),
        },
      },
      {
        onSuccess: () => {
          toast.success("Exchange order successfully");
          handleCloseDrawer();
        },
        onError: () => {
          toast.error("Exchange order fail");
          handleCloseDrawer();
        },
      },
    );
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleCloseDrawer();
        }
      }}
      direction="right"
    >
      <DrawerContent className="w-full max-w-[720px] overflow-y-auto p-6 data-[vaul-drawer-direction=right]:sm:max-w-[720px]">
        <DrawerHeader className="relative px-0 pb-4 pr-12">
          <DrawerTitle>Exchange</DrawerTitle>
          <DrawerDescription>
            Select products and carrier for exchange order
          </DrawerDescription>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
            onClick={handleCloseDrawer}
          >
            <X className="h-5 w-5" />
          </Button>
        </DrawerHeader>

        <div className="space-y-4">
          <Popover open={openProductPopover} onOpenChange={setOpenProductPopover}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full justify-between py-1"
              >
                Select Products
              </Button>
            </PopoverTrigger>
            <PopoverContent className="z-[200] w-[var(--radix-popover-trigger-width)] p-0 pointer-events-auto">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search product..."
                  value={queryParams}
                  onValueChange={(value) => setQueryParams(value)}
                />
                <CommandList>
                  <CommandEmpty>No product found.</CommandEmpty>
                  <CommandGroup className="h-96 overflow-y-auto">
                    {isLoading && <CommandItem disabled>Loading...</CommandItem>}
                    {isError && (
                      <CommandItem disabled>Error loading products</CommandItem>
                    )}
                    {filteredProducts.map((product) => {
                      const priceLabel = hasValidPrice(product.final_price)
                        ? `€${formatCurrency(Number(product.final_price))}`
                        : "No price";

                      return (
                        <CommandItem
                          key={product.id}
                          value={product.id ?? ""}
                          onSelect={() => handleSelectProduct(product)}
                          className="cursor-pointer"
                        >
                          <div className="flex min-w-0 items-center gap-3">
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
                                ID: {product.id_provider ?? "-"} | SKU: {" "}
                                {product.sku?.trim() ? product.sku : "-"} |{" "}
                                {priceLabel}
                              </p>
                            </div>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Select onValueChange={setCarrier} value={carrier}>
            <SelectTrigger className="border">
              <SelectValue placeholder="Select carrier" />
            </SelectTrigger>

            <SelectContent className="z-[210] max-h-72">
              {carrierOptions.map((carrierItem) => (
                <SelectItem key={carrierItem.id} value={carrierItem.id}>
                  <div className="flex items-center gap-2">
                    <Image
                      src={carrierItem.logo}
                      alt={carrierItem.label}
                      width={18}
                      height={18}
                      className="rounded-sm object-contain"
                      unoptimized
                    />
                    <span>{carrierItem.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {listProducts.length > 0 && (
            <div className="space-y-3">
              <div className="grid grid-cols-6 gap-3 text-sm font-medium text-muted-foreground">
                <div className="col-span-4">Product</div>
                <div>Quantity</div>
                <div></div>
              </div>

              {listProducts.map(({ product, quantity }) => {
                const selectedPriceLabel = hasValidPrice(product.final_price)
                  ? `€${formatCurrency(Number(product.final_price))}`
                  : "No price";

                return (
                  <div
                    key={product.id}
                    className="grid grid-cols-6 items-center gap-3 rounded-md border p-2"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <Image
                        src={
                          product.static_files?.[0]?.url ??
                          "/product-placeholder.png"
                        }
                        width={50}
                        height={50}
                        alt=""
                        className="!h-[40px] rounded-sm object-cover"
                        unoptimized
                      />
                      <div className="min-w-0">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground">
                          ID: {product.id_provider ?? "-"} | SKU: {" "}
                          {product.sku?.trim() ? product.sku : "-"} |{" "}
                          {selectedPriceLabel}
                        </div>
                      </div>
                    </div>

                    <Input
                      type="number"
                      min={0}
                      step="1"
                      value={quantity}
                      onChange={(event) =>
                        handleQuantityChange(product.id, Number(event.target.value))
                      }
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-fit hover:bg-red-50"
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

        <DrawerFooter className="mt-4 flex-row justify-start gap-3 px-0 pb-0">
          <DrawerClose asChild>
            <Button
              type="button"
              className="bg-gray-400 text-white hover:bg-gray-500"
              disabled={exchangeOrderMutation.isPending}
              onClick={handleCloseDrawer}
            >
              Cancel
            </Button>
          </DrawerClose>
          <Button
            type="button"
            onClick={handleExchange}
            hasEffect
            variant="secondary"
            disabled={exchangeOrderMutation.isPending}
          >
            {exchangeOrderMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Confirm"
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ExchangeConfirmDialog;
