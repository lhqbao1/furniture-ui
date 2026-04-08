import { toast } from "sonner";

type SubmitProductValues = {
  brand_id?: string | null;
  weight?: number | null;
  delivery_cost?: number | null;
  width?: number | null;
  height?: number | null;
  length?: number | null;
  cost?: number | null;
  final_price?: number | null;
  price?: number | null;
  stock?: number | null;
  bundles?: unknown[] | null;
  tag?: string | null;
  is_active?: boolean | null;
  pdf_files?: unknown[] | null;
  [key: string]: unknown;
};

type MutationLike = {
  mutate: (
    payload: unknown,
    options?: {
      onSuccess?: () => void;
      onError?: () => void;
    },
  ) => void;
};

type RouterLike = {
  push: (url: string, options?: { locale?: string }) => void;
  refresh: () => void;
};

type FormLike = {
  getValues: () => SubmitProductValues;
  reset: () => void;
};

type SubmitProductDSPArgs = {
  productValues?: { id?: string | null } | null;
  productValuesClone?: unknown;
  addProductMutation: MutationLike;
  editProductMutation: MutationLike;
  router: RouterLike;
  locale: string;
  form: FormLike;
};

export const submitProductDSP = async ({
  productValues,
  productValuesClone,
  addProductMutation,
  editProductMutation,
  router,
  locale,
  form,
}: SubmitProductDSPArgs) => {
  const latestValues = form.getValues();
  const normalizedBrandId =
    typeof latestValues.brand_id === "string" &&
    latestValues.brand_id.trim().length > 0
      ? latestValues.brand_id.trim()
      : null;

  const payload = {
    ...latestValues, // 👈 Thay values bằng latestValues
    weight:
      latestValues.weight || latestValues.weight === 0
        ? latestValues.weight
        : undefined,
    delivery_cost:
      latestValues.delivery_cost || latestValues.delivery_cost === 0
        ? latestValues.delivery_cost
        : undefined,
    width:
      latestValues.width || latestValues.width === 0
        ? latestValues.width
        : undefined,
    height:
      latestValues.height || latestValues.height === 0
        ? latestValues.height
        : undefined,
    length:
      latestValues.length || latestValues.length === 0
        ? latestValues.length
        : undefined,
    cost:
      latestValues.cost || latestValues.cost === 0
        ? latestValues.cost
        : undefined,
    final_price: latestValues.final_price ?? latestValues.price ?? undefined,
    ...(latestValues.price && { price: latestValues.price }),
    stock: latestValues.stock ?? 1,
    is_bundle:
      latestValues.bundles && latestValues.bundles?.length > 0 ? true : false,
    tag: latestValues.tag === "" ? undefined : latestValues.tag,
    is_active: productValuesClone ? false : latestValues.is_active ?? true,
    brand_id: normalizedBrandId ?? undefined,
    pdf_files: latestValues.pdf_files ?? [],
  };

  if (productValuesClone) {
    const finalPayload = {
      ...payload,
      ebay: false,
    };
    delete finalPayload.marketplace_products;
    delete finalPayload.url_key;
    delete finalPayload.meta_title;
    delete finalPayload.meta_description;
    delete finalPayload.meta_keywords;

    addProductMutation.mutate(finalPayload, {
      onSuccess: () => {
        toast.success("Product add successfully");
        form.reset();
        router.push("/dsp/admin/products/list", { locale });
      },
      onError: () => {
        toast.error(
          "Failed to add product. Please check duplication for SKU or EAN",
        );
      },
    });
    return;
  }

  if (productValues) {
    editProductMutation.mutate(
      { product_id: productValues.id ?? "", input: payload },
      {
        onSuccess: () => {
          toast.success("Product updated successfully");
          router.push("/dsp/admin/products/list", { locale });
          router.refresh();
        },
        onError: () => {
          toast.error("Failed to update product");
        },
      },
    );
    return;
  }

  addProductMutation.mutate(payload, {
    onSuccess: () => {
      toast.success("Add product successfully");
      form.reset();
    },
    onError: () => {
      toast.error(
        "Failed to add product. Please check duplication for SKU or EAN",
      );
    },
  });
};
