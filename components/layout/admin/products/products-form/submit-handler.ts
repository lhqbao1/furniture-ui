import { toast } from "sonner";
import {
  aggregatePackages,
  calcDeliveryCost,
} from "@/lib/shipping/delivery-cost";

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
  let loadingToastId: string | number | undefined;
  const startLoadingToast = (message: string) => {
    loadingToastId = toast.loading(message);
  };
  const showErrorToast = (message: string, description?: string) => {
    toast.error(message, {
      id: loadingToastId,
      description,
    });
  };
  const showSuccessToast = (message: string) => {
    toast.success(message, { id: loadingToastId });
  };
  const getErrorMessage = (error: any) => {
    const fallback = "Something went wrong. Please try again.";

    if (!error) return { message: fallback };

    const detail =
      error?.response?.data?.detail ??
      error?.response?.data?.message ??
      error?.message ??
      "";

    if (typeof detail === "string") {
      const lower = detail.toLowerCase();
      if (
        lower.includes("unique") ||
        lower.includes("duplicate") ||
        lower.includes("integrityerror") ||
        lower.includes("uniqueviolation")
      ) {
        const keyMatch = detail.match(/Key\s+\(([^)]+)\)=\(([^)]+)\)/i);
        if (keyMatch?.[1]) {
          const field = keyMatch[1].toUpperCase();
          const value = keyMatch[2];
          return {
            message: `Duplicate ${field}`,
            description: `Duplication in ${field}${value ? ` (${value})` : ""}`,
          };
        }

        const constraintMatch = detail.match(/products_([a-z0-9_]+)_key/i);
        if (constraintMatch?.[1]) {
          const field = constraintMatch[1].toUpperCase();
          return {
            message: `Duplicate ${field}`,
            description: `Duplication in ${field}`,
          };
        }

        return {
          message: "Duplicate SKU or EAN",
          description:
            "Please check existing products and ensure SKU/EAN are unique.",
        };
      }

      return { message: "Failed to save product", description: detail };
    }

    if (Array.isArray(detail?.errors) && detail.errors.length > 0) {
      return {
        message: "Failed to save product",
        description:
          detail.errors[0]?.message ?? detail.errors[0]?.detail ?? fallback,
      };
    }

    return { message: "Failed to save product", description: fallback };
  };

  const latestValues = form.getValues();

  const mergedPackage = aggregatePackages(
    latestValues.packages ?? [],
    latestValues.bundles ?? [],
  );
  const { error } = calcDeliveryCost(
    mergedPackage ? [mergedPackage] : [],
    latestValues.carrier,
  );
  if (error) {
    toast.error(`${error} Change to spedition carrier`);
    return;
  }

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

    startLoadingToast("Creating product...");
    addProductMutation.mutate(finalPayload, {
      onSuccess: () => {
        showSuccessToast("Product add successfully");
        form.reset();
        router.push("/admin/products/list", { locale });
      },
      onError: (error: any) => {
        const { message, description } = getErrorMessage(error);
        showErrorToast(message, description);
      },
    });
    return;
  }

  if (productValues) {
    startLoadingToast("Updating product...");
    editProductMutation.mutate(
      { id: productValues.id ?? "", input: payload },
      {
        onSuccess: () => {
          showSuccessToast("Updated product successfully");
        },
        onError: (error: any) => {
          const { message, description } = getErrorMessage(error);
          showErrorToast(message, description);
        },
      },
    );
    return;
  }

  startLoadingToast("Creating product...");
  addProductMutation.mutate(payload, {
    onSuccess: () => {
      showSuccessToast("Add product successfully");
      form.reset();
    },
    onError: (error: any) => {
      const { message, description } = getErrorMessage(error);
      showErrorToast(message, description);
    },
  });
};
