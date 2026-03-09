"use client";

import { ProductItem } from "@/types/products";
import React, { useState } from "react";
import ProductForm from "../products-form/add-product-form";
import { ProductInput } from "@/lib/schema/product";
import { editProduct } from "@/features/products/api";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          className="text-wrap cursor-pointer hover:underline text-left"
        >
          {product.id_provider}
        </button>
      </DrawerTrigger>
      <DrawerContent className="p-6 w-[95vw] max-w-none data-[vaul-drawer-direction=right]:sm:max-w-[1600px] overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>Edit Product</DrawerTitle>
        </DrawerHeader>
        <div className="relative">
          <ProductForm productValues={product} onSubmit={handleEdit} isDrawer />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default EditProductDrawer;
