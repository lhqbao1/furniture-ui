import { toast } from "sonner";

function cleanPackages(packages?: any[]) {
  if (!Array.isArray(packages)) return undefined;

  return packages
    .filter((pkg) =>
      ["length", "width", "height", "weight"].every(
        (key) => pkg[key] !== null && pkg[key] !== undefined,
      ),
    )
    .map((pkg) => ({
      length: pkg.length,
      width: pkg.width,
      height: pkg.height,
      weight: pkg.weight,
    }));
}

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
  const latestValues = form.getValues();

  const cleanedPackages = cleanPackages(latestValues.packages);

  const payload = {
    ...latestValues, // 👈 Thay values bằng latestValues
    packages:
      cleanedPackages && cleanedPackages.length > 0
        ? cleanedPackages
        : undefined, // 👈 không gửi nếu rỗng
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
    stock: latestValues.stock ?? 0,
    is_bundle:
      latestValues.bundles && latestValues.bundles?.length > 0 ? true : false,
    tag: latestValues.tag === "" ? undefined : latestValues.tag,
    is_active: productValuesClone ? false : (latestValues.is_active ?? true),
    brand_id: latestValues.brand_id ?? null,
    pdf_files: latestValues.pdf_files ?? [],
  };

  // if (payload.is_econelo) {
  //   if (!payload.price || !payload.final_price) {
  //     toast.error("Econelo products need both price and sale price");
  //     return;
  //   }
  // }

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
