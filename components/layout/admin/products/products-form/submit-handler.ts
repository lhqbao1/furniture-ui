import { ProductInput } from "@/lib/schema/product";
import { toast } from "sonner";

export const submitProduct = async ({
  values,
  productValues,
  productValuesClone,
  addProductMutation,
  editProductMutation,
  router,
  locale,
  form,
}: any) => {
  const payload = {
    ...values,
    weight: values.weight || values.weight === 0 ? values.weight : undefined,
    delivery_cost:
      values.delivery_cost || values.delivery_cost === 0
        ? values.delivery_cost
        : undefined,
    width: values.width || values.width === 0 ? values.width : undefined,
    height: values.height || values.height === 0 ? values.height : undefined,
    length: values.length || values.length === 0 ? values.length : undefined,
    cost: values.cost || values.cost === 0 ? values.cost : undefined,
    final_price: values.final_price ?? values.price ?? undefined,
    ...(values.price && { price: values.price }),
    stock: values.stock ?? 1,
    is_bundle: values.bundles && values.bundles?.length > 0 ? true : false,
    tag: values.tag === "" ? undefined : values.tag,
    is_active: productValuesClone ? false : values.is_active ?? true,
    brand_id: values.brand_id,
  };

  if (payload.is_econelo) {
    if (!payload.price || !payload.final_price) {
      toast.error("Econelo products need both price and sale price");
      return;
    }
  }

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
        router.push("/admin/products/list", { locale });
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
          toast.success("Updated product successfully");
        },
        onError: () => {
          toast.error("Updated product fail");
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
