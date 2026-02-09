"use client";
import ProductFormSkeleton from "@/components/layout/admin/products/products-form/product-form-skeleton";
import { useAddProduct, useGetProductById } from "@/features/products/hook";
import React from "react";
import { useRouter } from "@/src/i18n/navigation";
import { ProductInput } from "@/lib/schema/product";
import { toast } from "sonner";
import ProductForm from "@/components/layout/admin/products/products-form/add-product-form";
import { useLocale } from "next-intl";
import { ProductItem } from "@/types/products";

const CloneProductPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = React.use(params); // unwrap Promise
  const router = useRouter();
  const locale = useLocale();
  const createProductMutation = useAddProduct();

  const { data, isLoading, isError } = useGetProductById(id);

  const sanitizedCloneValues = React.useMemo<
    Partial<ProductItem> | undefined
  >(() => {
    if (!data) return undefined;

    const { ean, sku, stock, result_stock, ...rest } = data;

    return {
      ...rest,
      ean: undefined,
      sku: undefined,
      stock: undefined,
      result_stock: undefined,
      is_active: false,
    };
  }, [data]);

  if (isError) return <div>No data</div>;
  if (isLoading || !data) return <ProductFormSkeleton />;

  const handleCreate = (values: ProductInput) => {
    createProductMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Product added successfully!");
        router.push("/admin/products/list", { locale });
      },
      onError: (error) => {
        toast.error(`Failed to add product ${error}`);
      },
    });
  };

  return (
    <div>
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Clone Product</h1>
        <ProductForm
          productValuesClone={sanitizedCloneValues}
          onSubmit={handleCreate}
          isPending={createProductMutation.isPending}
        />
      </div>
    </div>
  );
};

export default CloneProductPage;
