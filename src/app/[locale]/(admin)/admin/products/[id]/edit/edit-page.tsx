"use client";

import React, { Suspense } from "react";
import { useRouter } from "@/src/i18n/navigation";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { useEditProduct, useGetProductById } from "@/features/products/hook";
import ProductFormSkeleton from "@/components/layout/admin/products/products-form/product-form-skeleton";
import { ProductInput } from "@/lib/schema/product";

// ✅ Lazy load form nặng
const ProductForm = React.lazy(
  () =>
    import("@/components/layout/admin/products/products-form/add-product-form")
);

interface EditProductPageProps {
  params: { id: string };
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = params;
  const router = useRouter();
  const locale = useLocale();
  const editProduct = useEditProduct();

  // ✅ Dữ liệu có sẵn từ cache nhờ HydrationBoundary
  const { data, isError, isPending } = useGetProductById(id);

  if (isError) return <div className="p-6 text-red-600">Product not found</div>;
  if (!data && !isError) return <ProductFormSkeleton />;

  const handleEdit = (values: ProductInput) => {
    if (!data?.id) return;

    editProduct.mutate(
      { id: data.id, input: values },
      {
        onSuccess: () => {
          toast.success("Product updated successfully");
          router.push("/admin/products/list", { locale });
        },
        onError: () => toast.error("Failed to update product"),
      }
    );
  };

  return (
    <div className="lg:p-6 p-2 mt-6 lg:mt-0">
      <h1 className="text-xl font-bold mb-4">Edit Product</h1>

      {data && (
        <ProductForm
          key={data.id} // đảm bảo reload form khi id thay đổi
          productValues={data}
          onSubmit={handleEdit}
          isPending={editProduct.isPending}
        />
      )}
    </div>
  );
}
