"use client";
import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateDeliveryOrder,
  useMakeOrderPaid,
} from "@/features/checkout/hook";
import { DeliveryOrderItem } from "@/features/checkout/api";
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
import { useGetAllProducts } from "@/features/products/hook";
import { ProductItem } from "@/types/products";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const ExchangeConfirmDialog = ({
  id,
  status,
  open,
  onClose,
}: ExchangeConfirmDialogProps) => {
  const exchangeOrderMutation = useCreateDeliveryOrder();
  const [openPopover, setOpenPopover] = useState(false);
  const [queryParams, setQueryParams] = useState("");
  const [listProducts, setListProducts] = useState<SelectedProduct[]>([]);
  const [carrier, setCarrier] = useState<string>();

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
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleQuantityChange = (id: string, value: number) => {
    setListProducts((prev) =>
      prev.map((item) =>
        item.product.id === id ? { ...item, quantity: value } : item,
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

  const handleExchange = () => {
    if (!carrier) {
      toast.error("Carrier is required");
      return;
    }

    const deliveryProducts = listProducts.map((i) => ({
      product_id: i.product.id,
      quantity: i.quantity,
    }));

    exchangeOrderMutation.mutate(
      {
        main_checkout_id: id,
        payload: {
          carrier: carrier ?? "",
          items: deliveryProducts,
        },
      },
      {
        onSuccess(data, variables, context) {
          toast.success("Exchange order successfully");
          onClose();
        },
        onError(error, variables, context) {
          toast.error("Exchange order fail");
          onClose();
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Exchange</DialogTitle>
        </DialogHeader>

        <Popover
          open={openPopover}
          onOpenChange={setOpenPopover}
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
                    className="flex justify-between cursor-pointer"
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

        <Select
          onValueChange={(value) => setCarrier(value)}
          value={carrier}
        >
          <SelectTrigger
            className="border"
            placeholderColor
          >
            <SelectValue placeholder="Select carrier" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="dpd">DPD</SelectItem>
            <SelectItem value="spedition">Spedition</SelectItem>
          </SelectContent>
        </Select>
        {/* Danh sách sản phẩm đã chọn */}
        {listProducts.length > 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-6 gap-3 text-sm font-medium text-muted-foreground">
              <div className="col-span-4">Product</div>
              <div>Quantity</div>
              <div></div>
            </div>

            {listProducts.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="grid grid-cols-6 gap-3 items-center border rounded-md p-2"
              >
                <div className="flex items-center gap-3 col-span-4">
                  <Image
                    src={
                      product.static_files?.[0]?.url ??
                      "/product-placeholder.png"
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

                <Button
                  variant="ghost"
                  className="w-fit hover:bg-red-50"
                  onClick={() => handleRemoveProduct(product.id)}
                >
                  <X className="text-red-400" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              className="bg-gray-400 text-white hover:bg-gray-500"
              disabled={exchangeOrderMutation.isPending}
            >
              Cancel
            </Button>
          </DialogClose>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExchangeConfirmDialog;
