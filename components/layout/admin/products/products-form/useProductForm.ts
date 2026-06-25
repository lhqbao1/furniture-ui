"use client";
import { useCallback, useEffect, useRef, useState } from "react";
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

type ProductFormValues = z.infer<typeof addProductSchema>;

const PRODUCT_FORM_DRAFT_PREFIX = "product-form-draft";
const PRODUCT_FORM_DRAFT_DELAY_MS = 150;

const isBrowserFileValue = (value: unknown) => {
  if (typeof window === "undefined") return false;
  return (
    (typeof File !== "undefined" && value instanceof File) ||
    (typeof Blob !== "undefined" && value instanceof Blob)
  );
};

const stringifyProductDraft = (values: unknown) => {
  try {
    return JSON.stringify(values, (_key, value) => {
      if (isBrowserFileValue(value)) return undefined;
      if (typeof value === "function") return undefined;
      return value;
    });
  } catch {
    return null;
  }
};

const readProductDraft = (draftKey: string) => {
  if (typeof window === "undefined") return null;

  try {
    const rawDraft = window.sessionStorage.getItem(draftKey);
    if (!rawDraft) return null;
    return JSON.parse(rawDraft) as ProductFormValues;
  } catch {
    return null;
  }
};

const writeProductDraft = (draftKey: string, values: unknown) => {
  if (typeof window === "undefined") return;

  const serializedDraft = stringifyProductDraft(values);
  if (!serializedDraft) return;

  try {
    window.sessionStorage.setItem(draftKey, serializedDraft);
  } catch {
    // Ignore quota/security errors; the in-memory form state still works.
  }
};

const removeProductDraft = (draftKey: string | null) => {
  if (!draftKey || typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(draftKey);
  } catch {
    // Ignore storage errors.
  }
};

export const useProductForm = ({
  productValues,
  productValuesClone,
  persistDraft = true,
}: {
  productValues?: Partial<ProductItem>;
  productValuesClone?: Partial<ProductItem>;
  persistDraft?: boolean;
}) => {
  const router = useRouter();
  const locale = useLocale();
  const addProductMutation = useAddProduct();
  const editProductMutation = useEditProduct();
  const [isLoadingSEO, setIsLoadingSEO] = useState(false);
  const [draftKey, setDraftKey] = useState<string | null>(null);

  const initialValues = normalizeProductValues(
    productValuesClone || productValues,
  );

  const form = useForm<z.infer<typeof addProductSchema>>({
    resolver: zodResolver(addProductSchema),
    defaultValues: initialValues,
    mode: "onBlur",
  });
  const lastResetSourceKeyRef = useRef<string | null>(null);
  const draftPersistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const skipDraftPersistRef = useRef(false);

  const clearDraftPersistTimer = useCallback(() => {
    if (!draftPersistTimerRef.current) return;
    clearTimeout(draftPersistTimerRef.current);
    draftPersistTimerRef.current = null;
  }, []);

  const clearCurrentDraft = useCallback(() => {
    skipDraftPersistRef.current = true;
    clearDraftPersistTimer();
    removeProductDraft(draftKey);

    const allowDraftPersist = () => {
      skipDraftPersistRef.current = false;
    };

    if (typeof window !== "undefined" && window.queueMicrotask) {
      window.queueMicrotask(allowDraftPersist);
    } else {
      allowDraftPersist();
    }
  }, [clearDraftPersistTimer, draftKey]);

  useEffect(() => {
    const sourceValues = productValuesClone ?? productValues;
    if (!sourceValues) return;

    const sourceMode = productValuesClone ? "clone" : "edit";
    const sourceKey = `${sourceMode}:${sourceValues.id ?? "new"}`;
    const nextDraftKey = persistDraft
      ? `${PRODUCT_FORM_DRAFT_PREFIX}:${sourceKey}`
      : null;
    const isDifferentProduct = lastResetSourceKeyRef.current !== sourceKey;

    setDraftKey(nextDraftKey);
    if (!isDifferentProduct) return;

    const normalizedValues = normalizeProductValues(sourceValues);
    const draftValues = nextDraftKey ? readProductDraft(nextDraftKey) : null;

    form.reset(draftValues ?? normalizedValues, {
      keepDefaultValues: Boolean(draftValues),
    });
    lastResetSourceKeyRef.current = sourceKey;
  }, [persistDraft, productValuesClone, productValues, form]);

  useEffect(() => {
    if (!draftKey) return;

    const subscription = form.watch((values) => {
      if (skipDraftPersistRef.current) return;
      clearDraftPersistTimer();
      draftPersistTimerRef.current = setTimeout(() => {
        writeProductDraft(draftKey, values);
      }, PRODUCT_FORM_DRAFT_DELAY_MS);
    });

    return () => {
      subscription.unsubscribe();
      clearDraftPersistTimer();
    };
  }, [clearDraftPersistTimer, draftKey, form]);

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
      onSaved: clearCurrentDraft,
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
