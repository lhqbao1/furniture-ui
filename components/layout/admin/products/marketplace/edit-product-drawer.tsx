"use client";

import { ProductItem } from "@/types/products";
import React, { useState } from "react";
import ProductForm from "../products-form/add-product-form";
import { ProductInput } from "@/lib/schema/product";
import { editProduct } from "@/features/products/api";
import { toast } from "sonner";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";

interface EditProductDrawerProps {
  product: ProductItem;
}

const EditProductDrawer = ({ product }: EditProductDrawerProps) => {
  const queryClient = useQueryClient();
  const editProductMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProductInput }) =>
      editProduct(input, id),
  });
  const [open, setOpen] = useState(false);

  const handleEdit = (values: ProductInput) => {
    if (!product?.id) return;

    const toastId = toast.loading(`Editing ${product.name}`);
    editProductMutation.mutate(
      { id: product.id, input: values },
      {
        onSuccess: () => {
          toast.success("Product updated successfully", { id: toastId });
          setOpen(false);
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["all-products"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({
              queryKey: ["product", product.id],
            });
          }, 500);
        },
        onError: () => toast.error("Failed to update product", { id: toastId }),
      },
    );
  };
  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen} handleOnly>
      <DrawerTrigger asChild>
        <button
          type="button"
          className="text-wrap cursor-pointer hover:underline text-left"
        >
          {product.id_provider}
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
          {open ? (
            <ProductForm
              productValues={product}
              onSubmit={handleEdit}
              isDrawer
            />
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default EditProductDrawer;
