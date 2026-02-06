"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { toast } from "sonner";
import { addProductSchema, ProductInput } from "@/lib/schema/product";
import { useRouter } from "@/src/i18n/navigation";
import { useLocale } from "next-intl";
import { useAddProduct, useEditProduct } from "@/features/products/hook";
import { ProductItem } from "@/types/products";
import { normalizeProductValues } from "./normalize-product-values";
import { submitProduct } from "./submit-handler";

export const useProductForm = ({
  productValues,
  productValuesClone,
}: {
  productValues?: Partial<ProductItem>;
  productValuesClone?: Partial<ProductItem>;
}) => {
  const router = useRouter();
  const locale = useLocale();
  const addProductMutation = useAddProduct();
  const editProductMutation = useEditProduct();
  const [isLoadingSEO, setIsLoadingSEO] = useState(false);

  const initialValues = normalizeProductValues(
    productValuesClone || productValues,
  );

  const form = useForm<z.infer<typeof addProductSchema>>({
    resolver: zodResolver(addProductSchema),
    defaultValues: initialValues,
    mode: "onBlur",
  });

  useEffect(() => {
    if (productValuesClone) {
      form.reset(normalizeProductValues(productValuesClone));
    }
    if (productValues) {
      form.reset(normalizeProductValues(productValues));
    }
  }, [productValuesClone, productValues, form]);

  console.log(productValues?.stock);

  const onSubmit = (values: ProductInput) => {
    submitProduct({
      values,
      productValues,
      productValuesClone,
      addProductMutation,
      editProductMutation,
      router,
      locale,
      form,
    });
  };

  return {
    form,
    onSubmit,
    isLoadingSEO,
    setIsLoadingSEO,
    addProductMutation,
    editProductMutation,
  };
};
