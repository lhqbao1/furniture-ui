"use client";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
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
  const lastResetSourceKeyRef = useRef<string | null>(null);
  const { isDirty } = form.formState;

  useEffect(() => {
    const sourceValues = productValuesClone ?? productValues;
    if (!sourceValues) return;

    const sourceMode = productValuesClone ? "clone" : "edit";
    const sourceKey = `${sourceMode}:${sourceValues.id ?? "new"}`;
    const isDifferentProduct = lastResetSourceKeyRef.current !== sourceKey;

    if (isDirty && !isDifferentProduct) return;

    form.reset(normalizeProductValues(sourceValues));
    lastResetSourceKeyRef.current = sourceKey;
  }, [productValuesClone, productValues, form, isDirty]);

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
