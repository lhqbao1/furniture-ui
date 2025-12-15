"use client";
import ProductFormDSP from "@/components/layout/dsp/admin/products/add/product-add-or-edit";
import AdminBackButton from "@/components/shared/admin-back-button";
import { useAddProductDSP } from "@/features/dsp/products/hook";
import { ProductInputDSP } from "@/lib/schema/dsp/product";
import React, { useEffect } from "react";
import { toast } from "sonner";

const DSPProductAddClient = () => {
  const addProduct = useAddProductDSP();
  const handleAddProduct = async (values: ProductInputDSP) => {
    addProduct.mutate(values, {
      onSuccess: () => {
        toast.success("Product added successfully!");
      },
      onError: (error) => {
        toast.error(`Failed to add product ${error}`);
      },
    });
  };

  useEffect(() => {
    // Prefetch form khi rảnh
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        import(
          "@/components/layout/dsp/admin/products/add/product-add-or-edit"
        );
      });
    } else {
      setTimeout(() => {
        import(
          "@/components/layout/dsp/admin/products/add/product-add-or-edit"
        );
      }, 2000);
    }
  }, []);

  return (
    <div className="space-y-6">
      <AdminBackButton />
      <ProductFormDSP
        onSubmit={handleAddProduct}
        isPending={addProduct.isPending}
      />
    </div>
  );
};

export default DSPProductAddClient;
