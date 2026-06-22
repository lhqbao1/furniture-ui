import { toast } from "sonner";
import {
  aggregatePackages,
  calcDeliveryCost,
} from "@/lib/shipping/delivery-cost";
import { ProductInput } from "@/lib/schema/product";
import { ProductItem } from "@/types/products";
import { UseFormReturn } from "react-hook-form";

type ProductFormMutation = {
  mutate: (
    payload: unknown,
    options: {
      onSuccess: () => void;
      onError: (error: unknown) => void;
    },
  ) => void;
};

type ProductFormRouter = {
  push: (href: string, options?: { locale: string }) => void;
};

type SubmitProductArgs = {
  values: ProductInput;
  productValues?: Partial<ProductItem>;
  productValuesClone?: Partial<ProductItem>;
  addProductMutation: ProductFormMutation;
  editProductMutation: ProductFormMutation;
  router: ProductFormRouter;
  locale: string;
  form: UseFormReturn<ProductInput>;
  onSaved?: () => void;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getErrorDetail = (error: unknown) => {
  if (!isRecord(error)) return "";

  const response = isRecord(error.response) ? error.response : null;
  const data = response && isRecord(response.data) ? response.data : null;
  const message = typeof error.message === "string" ? error.message : "";

  return data?.detail ?? data?.message ?? message;
};

const getFirstErrorDescription = (detail: unknown, fallback: string) => {
  if (!isRecord(detail) || !Array.isArray(detail.errors)) return fallback;

  const firstError = detail.errors[0];
  if (!isRecord(firstError)) return fallback;

  return (
    (typeof firstError.message === "string" && firstError.message) ||
    (typeof firstError.detail === "string" && firstError.detail) ||
    fallback
  );
};

const omitPayloadKeys = (
  payload: Record<string, unknown>,
  keys: string[],
) => {
  const blockedKeys = new Set(keys);
  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => !blockedKeys.has(key)),
  );
};

function cleanPackages(packages?: unknown[]) {
  if (!Array.isArray(packages)) return undefined;

  return packages
    .filter(isRecord)
    .filter((pkg) =>
      ["length", "width", "height", "weight"].every((key) => {
        const value = pkg[key];
        return value !== null && value !== undefined;
      }),
    )
    .map((pkg) => ({
      length: pkg.length,
      width: pkg.width,
      height: pkg.height,
      weight: pkg.weight,
    }));
}

export const submitProduct = async ({
  values: submittedValues,
  productValues,
  productValuesClone,
  addProductMutation,
  editProductMutation,
  router,
  locale,
  form,
  onSaved,
}: SubmitProductArgs) => {
  void submittedValues;
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
  const getErrorMessage = (error: unknown) => {
    const fallback = "Something went wrong. Please try again.";

    if (!error) return { message: fallback };

    const detail = getErrorDetail(error);

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

    if (isRecord(detail) && Array.isArray(detail.errors) && detail.errors.length > 0) {
      return {
        message: "Failed to save product",
        description: getFirstErrorDescription(detail, fallback),
      };
    }

    return { message: "Failed to save product", description: fallback };
  };

  const latestValues = form.getValues();

  const mergedPackage = aggregatePackages(
    latestValues.packages ?? [],
    latestValues.bundles ?? [],
  );
  const normalizedCarrier = String(latestValues.carrier ?? "")
    .toLowerCase()
    .trim();
  const mergedWeight = Number(mergedPackage?.weight ?? 0);
  const isAmmOrSpeditionCarrier =
    normalizedCarrier.includes("amm") ||
    normalizedCarrier.includes("spedition");
  const isGlsCarrier = normalizedCarrier === "gls";

  if (
    Number.isFinite(mergedWeight) &&
    mergedWeight > 31 &&
    !isAmmOrSpeditionCarrier &&
    !isGlsCarrier
  ) {
    toast.info(
      `This product is over 31kg and carrier "${latestValues.carrier || "unknown"}" is selected. Please make sure this is the intended carrier.`,
    );
  }

  const { error } = calcDeliveryCost(
    mergedPackage ? [mergedPackage] : [],
    latestValues.carrier,
  );
  if (error) {
    toast.info(
      `Shipping check warning for carrier "${latestValues.carrier || "unknown"}": ${error}. Please make sure the selected carrier is correct.`,
    );
  }

  const cleanedPackages = cleanPackages(latestValues.packages);
  const stockValue =
    productValues &&
    productValues.stock !== undefined &&
    productValues.stock !== null
      ? productValues.stock
      : latestValues.stock;

  const payload: Record<string, unknown> = {
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
    stock: stockValue ?? 0,
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
    const cleanPayload = omitPayloadKeys(payload, ["marketplace_products"]);
    const rest = omitPayloadKeys(cleanPayload, [
      "url_key",
      "meta_title",
      "meta_description",
      "meta_keywords",
    ]);

    const finalPayload = {
      ...rest,
      ebay: false,
    };

    startLoadingToast("Creating product...");
    addProductMutation.mutate(finalPayload, {
      onSuccess: () => {
        showSuccessToast("Product add successfully");
        onSaved?.();
        form.reset();
        router.push("/admin/products/list", { locale });
      },
      onError: (error: unknown) => {
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
          onSaved?.();
          form.reset(latestValues);
        },
        onError: (error: unknown) => {
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
      onSaved?.();
      form.reset();
    },
    onError: (error: unknown) => {
      const { message, description } = getErrorMessage(error);
      showErrorToast(message, description);
    },
  });
};
