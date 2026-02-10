"use client";

import { ProductItem } from "@/types/products";
import React, { useState } from "react";
import ProductForm from "../products-form/add-product-form";
import { ProductInput } from "@/lib/schema/product";
import { useEditProduct } from "@/features/products/hook";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface EditProductDrawerProps {
  product: ProductItem;
}

const EditProductDrawer = ({ product }: EditProductDrawerProps) => {
  const editProduct = useEditProduct();
  const [open, setOpen] = useState(false);

  const handleEdit = (values: ProductInput) => {
    if (!product?.id) return;

    const toastId = toast.loading(`Editing ${product.name}`);
    editProduct.mutate(
      { id: product.id, input: values },
      {
        onSuccess: () => {
          toast.success("Product updated successfully", { id: toastId });
          setOpen(false);
        },
        onError: () => toast.error("Failed to update product", { id: toastId }),
      },
    );
  };
  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <div className="text-wrap cursor-pointer" onClick={() => setOpen(true)}>
        {product.name}
      </div>
      <DrawerContent className="p-6 w-[95vw] max-w-none data-[vaul-drawer-direction=right]:sm:max-w-[1600px] mx-auto overflow-auto">
        <DrawerHeader>
          <DrawerTitle>Edit Product</DrawerTitle>
        </DrawerHeader>
        <ProductForm productValues={product} onSubmit={handleEdit} isDrawer />
      </DrawerContent>
    </Drawer>
  );
};

export default EditProductDrawer;
