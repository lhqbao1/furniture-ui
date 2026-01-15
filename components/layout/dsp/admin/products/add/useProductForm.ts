"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { addProductSchema, ProductInput } from "@/lib/schema/product";
import { useRouter } from "@/src/i18n/navigation";
import { useLocale } from "next-intl";
import { useAddProduct, useEditProduct } from "@/features/products/hook";
import { ProductItem } from "@/types/products";
import { normalizeProductValues } from "@/components/layout/admin/products/products-form/normalize-product-values";
import { submitProductDSP } from "./submit-handler";
import {
  addProductDSPSchema,
  defaultValuesDSP,
} from "@/lib/schema/dsp/product";
import { useAddProductDSP } from "@/features/dsp/products/hook";

export const useProductFormDSP = ({
  productValues,
  productValuesClone,
}: {
  productValues?: Partial<ProductItem>;
  productValuesClone?: Partial<ProductItem>;
}) => {
  const router = useRouter();
  const locale = useLocale();
  const editProductMutation = useEditProduct();
  const addProductMutation = useAddProductDSP();
  const [isLoadingSEO, setIsLoadingSEO] = useState(false);

  const initialValues = normalizeProductValues(
    productValuesClone || defaultValuesDSP,
  );

  const form = useForm<z.infer<typeof addProductDSPSchema>>({
    resolver: zodResolver(addProductDSPSchema),
    defaultValues: initialValues,
    mode: "onBlur",
  });

  useEffect(() => {
    if (productValuesClone) {
      form.reset(normalizeProductValues(productValuesClone));
    } else if (productValues) {
      form.reset(normalizeProductValues(productValues));
    }
  }, [productValuesClone, productValues, form]);

  const onSubmit = (values: ProductInput) => {
    submitProductDSP({
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
