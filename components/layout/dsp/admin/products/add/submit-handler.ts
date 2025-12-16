import { toast } from "sonner";

export const submitProductDSP = async ({
  values,
  productValues,
  productValuesClone,
  addProductMutation,
  editProductMutation,
  router,
  locale,
  form,
}: any) => {
  const latestValues = form.getValues();

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
    brand_id: latestValues.brand_id,
    pdf_files: latestValues.pdf_files ?? [],
  };

  if (productValuesClone) {
    const { marketplace_products, ...cleanPayload } = payload;

    const { url_key, meta_title, meta_description, meta_keywords, ...rest } =
      cleanPayload;

    const finalPayload = {
      ...rest,
      ebay: false,
    };

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
      { id: productValues.id ?? "", input: payload },
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
