"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ProductInput } from "@/lib/schema/product";
import { ProductItem } from "@/types/products";
import { useEditProduct } from "@/features/products/hook";
import { syncToEbay, syncToEbayInput } from "@/features/ebay/api";
import { syncToKaufland, syncToKauflandInput } from "@/features/kaufland/api";
import { SyncToAmazonInput, syncToAmazon } from "@/features/amazon/api";
import { stripHtmlRegex } from "@/hooks/simplifyHtml";
import { calculateAvailableStock } from "@/hooks/calculate_available_stock";

const NORMA_OWNER_BUSINESS_NAME = "NORMA24 Online-Shop GmbH & Co. KG";
const NORMA_PACKAGE_FALLBACK = {
  length: 120,
  width: 80,
  height: 60,
  weight: 8,
};

type SaveAndSyncMarketplacesButtonProps = {
  form: UseFormReturn<ProductInput>;
  productValues?: Partial<ProductItem>;
  disabled?: boolean;
  className?: string;
};

const cleanPackages = (packages?: ProductInput["packages"]) => {
  if (!Array.isArray(packages)) return undefined;

  const validPackages = packages
    .filter((pkg) =>
      ["length", "width", "height", "weight"].every(
        (key) =>
          pkg?.[key as keyof typeof pkg] !== null &&
          pkg?.[key as keyof typeof pkg] !== undefined,
      ),
    )
    .map((pkg) => ({
      length: Number(pkg?.length ?? 0),
      width: Number(pkg?.width ?? 0),
      height: Number(pkg?.height ?? 0),
      weight: Number(pkg?.weight ?? 0),
    }));

  return validPackages.length > 0 ? validPackages : undefined;
};

const getMarketplaceData = (product: ProductItem, marketplace: string) =>
  product.marketplace_products?.find(
    (item) => item.marketplace?.toLowerCase() === marketplace.toLowerCase(),
  );

const parseErrorMessage = (error: unknown): string => {
  if (!error) return "Unknown error";
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  const detail = (
    error as {
      response?: { data?: { detail?: unknown; message?: unknown; error?: unknown } };
    }
  )?.response?.data;

  return String(
    detail?.detail ?? detail?.message ?? detail?.error ?? "Unknown error",
  );
};

function getFirstErrorMessage(
  errors: Record<string, unknown>,
): string | undefined {
  for (const key in errors) {
    const err = errors[key] as { message?: unknown } | undefined;
    if (typeof err?.message === "string") return err.message;
    if (typeof err === "object") {
      const nested = getFirstErrorMessage(err as Record<string, unknown>);
      if (nested) return nested;
    }
  }
  return undefined;
}

const SaveAndSyncMarketplacesButton = ({
  form,
  productValues,
  disabled,
  className,
}: SaveAndSyncMarketplacesButtonProps) => {
  const editProductMutation = useEditProduct();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const syncAllMarketplaces = async (product: ProductItem) => {
    const results: Array<{
      marketplace: "ebay" | "kaufland" | "amazon";
      success: boolean;
      message?: string;
    }> = [];
    const availableStock = calculateAvailableStock(product);

    const syncEbayDefault = async () => {
      const ebayData = getMarketplaceData(product, "ebay");
      const missingField = [
        { value: product.ean, label: "EAN" },
        { value: product.name, label: "Name" },
        { value: product.sku, label: "SKU" },
        { value: product.description, label: "Description" },
        {
          value: product.static_files && product.static_files.length > 0,
          label: "Images",
        },
        { value: product.final_price, label: "Final price" },
        { value: product.carrier, label: "Carrier" },
        { value: product.brand, label: "Brand" },
      ].find((field) => !field.value);

      if (missingField) {
        return {
          marketplace: "ebay" as const,
          success: false,
          message: `Missing ${missingField.label}`,
        };
      }

      const payload: syncToEbayInput = {
        price: ebayData?.final_price ?? product.final_price,
        sku: product.id_provider,
        stock: ebayData?.max_stock ?? availableStock,
        tax: product.tax ? product.tax : null,
        product: {
          description: stripHtmlRegex(ebayData?.description ?? product.description),
          title: ebayData?.name ?? product.name,
          imageUrls:
            product.static_files?.map((file) => file.url.replace(/\s+/g, "%20")) ??
            [],
          ean: product.ean ? [product.ean] : [],
        },
        carrier: product.carrier,
        brand: product.brand ? product.brand.name : "",
        ...(ebayData?.min_stock !== undefined && {
          min_stock: ebayData.min_stock,
        }),
        ...(ebayData?.max_stock !== undefined && {
          max_stock: ebayData.max_stock,
        }),
        manufacturer: {
          name: product.brand?.company_name ?? "",
          address: product.brand?.company_address ?? "",
          city: product.brand?.company_city ?? "",
          country: product.brand?.company_country ?? "",
          email: product.brand?.company_email ?? "",
          postal_code: product.brand?.company_postal_code ?? "",
          phone: product.brand?.company_phone ?? "",
        },
        documents:
          product.pdf_files && product.pdf_files.length > 0
            ? product.pdf_files
            : null,
        ebay_offer_id: ebayData?.marketplace_offer_id ?? null,
      };

      await syncToEbay(payload);
      return { marketplace: "ebay" as const, success: true };
    };

    const syncKauflandDefault = async () => {
      const kauflandData = getMarketplaceData(product, "kaufland");
      const missingField = [
        { value: product.ean, label: "EAN" },
        { value: product.name, label: "Name" },
        { value: product.sku, label: "SKU" },
        { value: product.description, label: "Description" },
        {
          value: product.static_files && product.static_files.length > 0,
          label: "Images",
        },
        { value: product.final_price, label: "Final price" },
        { value: product.carrier, label: "Carrier" },
        { value: product.brand, label: "Brand" },
        { value: product.materials, label: "Materials" },
        { value: product.color, label: "Color" },
      ].find((field) => !field.value);

      if (missingField) {
        return {
          marketplace: "kaufland" as const,
          success: false,
          message: `Missing ${missingField.label}`,
        };
      }

      const payload: syncToKauflandInput = {
        ean: product.ean,
        title: kauflandData?.name ?? product.name,
        description: kauflandData?.description ?? product.description,
        image_urls:
          product.static_files?.map((f) => f.url.replace(/\s+/g, "%20")) ?? [],
        price: kauflandData?.final_price ?? product.final_price,
        stock: kauflandData?.max_stock ?? availableStock,
        carrier: product.carrier,
        sku: product.id_provider,
        product_id: product.id,
        ...(kauflandData?.min_stock !== undefined && {
          min_stock: kauflandData.min_stock,
        }),
        ...(kauflandData?.max_stock !== undefined && {
          max_stock: kauflandData.max_stock,
        }),
        marketplace_offer_id: kauflandData?.marketplace_offer_id,
        brand: {
          address: product.brand?.company_address ?? "",
          email: product.brand?.company_email ?? "",
          name: product.brand?.name ?? "",
          phone: product.brand?.company_phone ?? "",
        },
        handling_time: kauflandData?.handling_time ?? 0,
        material: product.materials,
        color: product.color,
        length: product.length || null,
        width: product.width || null,
        height: product.height || null,
        weight: product.weight || null,
      };

      await syncToKaufland(payload);
      return { marketplace: "kaufland" as const, success: true };
    };

    const syncAmazonDefault = async () => {
      const amazonData = getMarketplaceData(product, "amazon");
      const hasPackageInformation =
        !!product.packages && product.packages.length > 0;
      const isNormaOwner =
        product.owner?.business_name === NORMA_OWNER_BUSINESS_NAME;
      const useNormaFallback = isNormaOwner && !hasPackageInformation;

      const resolvedLength = useNormaFallback
        ? NORMA_PACKAGE_FALLBACK.length
        : product.length;
      const resolvedWidth = useNormaFallback
        ? NORMA_PACKAGE_FALLBACK.width
        : product.width;
      const resolvedHeight = useNormaFallback
        ? NORMA_PACKAGE_FALLBACK.height
        : product.height;
      const resolvedWeight = useNormaFallback
        ? NORMA_PACKAGE_FALLBACK.weight
        : product.weight;

      const missingField = [
        { value: product.ean, label: "EAN" },
        { value: product.name, label: "Name" },
        { value: product.sku, label: "SKU" },
        { value: product.description, label: "Description" },
        {
          value: product.static_files && product.static_files.length > 0,
          label: "Images",
        },
        {
          value: hasPackageInformation || useNormaFallback,
          label: "Packages information",
        },
        { value: product.final_price, label: "Final price" },
        { value: product.carrier, label: "Carrier" },
        { value: product.brand, label: "Brand" },
        { value: resolvedLength, label: "Length" },
        { value: resolvedWidth, label: "Width" },
        { value: resolvedHeight, label: "Height" },
        { value: resolvedWeight, label: "Net Weight" },
        {
          value: amazonData?.country_of_origin,
          label: "Country of origin (Amazon)",
        },
        { value: amazonData?.handling_time, label: "Handling time (Amazon)" },
      ].find((field) => !field.value);

      if (missingField) {
        return {
          marketplace: "amazon" as const,
          success: false,
          message: `Missing ${missingField.label}`,
        };
      }

      const payload: SyncToAmazonInput = {
        sku: amazonData?.sku ?? product.id_provider,
        title: amazonData?.name ?? product.name,
        manufacturer: product.brand ? product.brand.company_name : "",
        description: amazonData?.description ?? product.description,
        price: amazonData?.final_price ?? product.final_price,
        ean: product.ean,
        part_number: product.sku,
        is_fragile: false,
        number_of_items: Number(product.amount_unit) || 0,
        included_components: product.name,
        weight: Number(resolvedWeight),
        height: Number(resolvedHeight),
        width: Number(resolvedWidth),
        length: Number(resolvedLength),
        package_length: hasPackageInformation
          ? Math.max(...(product.packages ?? []).map((p) => p.length ?? 0))
          : Number(resolvedLength),
        package_height: hasPackageInformation
          ? Math.max(...(product.packages ?? []).map((p) => p.height ?? 0))
          : Number(resolvedHeight),
        package_width: hasPackageInformation
          ? Math.max(...(product.packages ?? []).map((p) => p.width ?? 0))
          : Number(resolvedWidth),
        color: product.color ?? "",
        unit_count: Number(product.amount_unit ?? 0),
        unit_count_type: product.unit ?? "",
        depth: 0,
        asin: null,
        stock: amazonData?.max_stock ?? availableStock,
        carrier: product.carrier,
        images: product.static_files?.map((f) => f.url) ?? [],
        brand: product.brand ? product.brand.name : "",
        model_number: product.sku,
        size: `${resolvedLength}x${resolvedWidth}x${resolvedHeight}`,
        country_of_origin: amazonData?.country_of_origin ?? "",
        min_stock: amazonData?.min_stock ?? 0,
        max_stock: amazonData?.max_stock ?? 10,
        handling_time: amazonData?.handling_time ?? 0,
        bullet_point1: product.bullet_point_1 ?? "",
        bullet_point2: product.bullet_point_2 ?? "",
        bullet_point3: product.bullet_point_3 ?? "",
        bullet_point4: product.bullet_point_4 ?? "",
        bullet_point5: product.bullet_point_5 ?? "",
      };

      await syncToAmazon(payload);
      return { marketplace: "amazon" as const, success: true };
    };

    const runMarketplaceSync = async (
      marketplace: "ebay" | "kaufland" | "amazon",
      runner: () => Promise<{
        marketplace: "ebay" | "kaufland" | "amazon";
        success: boolean;
        message?: string;
      }>,
    ) => {
      const label =
        marketplace === "ebay"
          ? "eBay"
          : marketplace === "kaufland"
            ? "Kaufland"
            : "Amazon";
      const toastId = toast.loading(`Syncing ${label}...`);

      try {
        const result = await runner();
        results.push(result);

        if (result.success) {
          toast.success(`${label} synced successfully`, { id: toastId });
        } else {
          toast.error(`${label} sync failed`, {
            id: toastId,
            description: result.message ?? "Unknown error",
          });
        }
      } catch (error) {
        const message = parseErrorMessage(error);
        results.push({
          marketplace,
          success: false,
          message,
        });
        toast.error(`${label} sync failed`, {
          id: toastId,
          description: message,
        });
      }
    };

    await runMarketplaceSync("ebay", syncEbayDefault);
    await runMarketplaceSync("kaufland", syncKauflandDefault);
    await runMarketplaceSync("amazon", syncAmazonDefault);

    return results;
  };

  const handleSaveAndSyncAll = form.handleSubmit(
    async () => {
      if (!productValues?.id) {
        toast.error("Save & Sync is only available in edit mode");
        return;
      }

      setIsProcessing(true);
      const updateToastId = toast.loading("Updating product...");

      try {
        const latestValues = form.getValues();
        const cleanedPackages = cleanPackages(latestValues.packages);
        const stockValue =
          productValues.stock !== undefined && productValues.stock !== null
            ? productValues.stock
            : latestValues.stock;

        const payload: ProductInput = {
          ...latestValues,
          packages: cleanedPackages,
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
            latestValues.bundles && latestValues.bundles.length > 0 ? true : false,
          tag: latestValues.tag === "" ? undefined : latestValues.tag,
          is_active: latestValues.is_active ?? true,
          brand_id: latestValues.brand_id ?? null,
          pdf_files: latestValues.pdf_files ?? [],
        };

        const updatedProduct = await editProductMutation.mutateAsync({
          id: productValues.id,
          input: payload,
        });

        toast.success("Product updated successfully", {
          id: updateToastId,
        });
        await syncAllMarketplaces(updatedProduct);
      } catch (error) {
        toast.error("Product update failed", {
          id: updateToastId,
          description: parseErrorMessage(error),
        });
      } finally {
        setIsProcessing(false);
      }
    },
    (errors) => {
      const message = getFirstErrorMessage(errors);
      toast.error("Form validation error", {
        description:
          message ?? "Please fix the highlighted fields and try again.",
      });
    },
  );

  if (!productValues?.id) return null;

  return (
    <Button
      type="button"
      variant="secondary"
      className={className}
      disabled={Boolean(disabled) || isProcessing}
      onClick={() => {
        void handleSaveAndSyncAll();
      }}
    >
      {isProcessing ? <Loader2 className="animate-spin" /> : "Save & Sync all"}
    </Button>
  );
};

export default SaveAndSyncMarketplacesButton;
