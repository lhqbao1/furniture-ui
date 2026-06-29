"use client";

import ProductForm from "@/components/layout/admin/products/products-form/add-product-form";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { getProductById } from "@/features/products/api";
import { useQuery } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { useState } from "react";

interface OrderProductEditDrawerProps {
  productId?: string | null;
  label: string;
}

const OrderProductEditDrawer = ({
  productId,
  label,
}: OrderProductEditDrawerProps) => {
  const [open, setOpen] = useState(false);
  const productQuery = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProductById(productId ?? ""),
    enabled: open && Boolean(productId),
    retry: false,
    refetchOnWindowFocus: false,
  });

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen} handleOnly>
      <DrawerTrigger asChild>
        <button
          type="button"
          className="font-medium text-secondary underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground"
          disabled={!productId}
        >
          {label}
        </button>
      </DrawerTrigger>
      <DrawerContent className="h-dvh w-screen max-w-none overflow-y-auto overflow-x-hidden p-0 data-[vaul-drawer-direction=right]:w-screen data-[vaul-drawer-direction=right]:sm:w-[95vw] data-[vaul-drawer-direction=right]:sm:max-w-[1600px] sm:p-6">
        <DrawerHeader className="sticky top-0 z-30 flex-row items-center justify-between border-b bg-white/95 px-4 py-3 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-4">
          <DrawerTitle className="text-lg sm:text-xl">Edit Product</DrawerTitle>
          <DrawerClose asChild>
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-lg border bg-white text-foreground shadow-sm transition-colors hover:bg-muted"
              aria-label="Close edit product"
            >
              <X className="size-5" />
            </button>
          </DrawerClose>
        </DrawerHeader>
        <div className="relative px-2 pb-6 sm:px-0 sm:pb-0">
          {open && productQuery.isLoading ? (
            <div className="flex min-h-[320px] items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" />
              Loading product…
            </div>
          ) : null}
          {open && productQuery.isError ? (
            <div className="flex min-h-[320px] items-center justify-center text-sm text-destructive">
              Failed to load product data.
            </div>
          ) : null}
          {open && productQuery.data ? (
            <ProductForm
              productValues={productQuery.data}
              onSubmit={() => undefined}
              isDrawer
            />
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default OrderProductEditDrawer;
