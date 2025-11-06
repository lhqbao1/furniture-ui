import { useSyncToEbay } from "@/features/ebay/hook";
import { useSyncToKaufland } from "@/features/kaufland/hook";
import { syncToEbayInput } from "@/features/ebay/api";
import { syncToKauflandInput } from "@/features/kaufland/api";
import { stripHtmlRegex } from "@/hooks/simplifyHtml";
import { ProductItem } from "@/types/products";
import EbayFormFields from "@/components/layout/admin/products/marketplace/ebay-form-field";
import KauflandFormFields from "@/components/layout/admin/products/marketplace/kaufland-form-field";

export interface MarketplaceConfig {
  label: string;
  useSyncHook: () => { mutate: (payload: any, opts?: any) => void; isPending: boolean };
  buildPayload: (product: ProductItem, values: any) => any;
  FormFields: React.FC<any>;
}

// 🎯 Cấu hình cho từng marketplace
export const MARKETPLACE_CONFIG: Record<string, MarketplaceConfig> = {
  ebay: {
    label: "eBay",
    useSyncHook: useSyncToEbay,
    FormFields: EbayFormFields,
    buildPayload: (product, values): syncToEbayInput => ({
      sku: product.sku,
      stock: product.stock,
      price: values.price ?? product.final_price,
      tax: product.tax ?? null,
      brand: product.brand?.name ?? "",
      carrier: product.carrier,
      product: {
        title: values.title ?? product.name,
        description: stripHtmlRegex(values.description ?? product.description),
        imageUrls:
          product.static_files?.map((f) => f.url.replace(/\s+/g, "%20")) ?? [],
        ean: product.ean ? [product.ean] : [],
      },
      ...(values.min_stock && { min_stock: values.min_stock }),
      ...(values.max_stock && { max_stock: values.max_stock }),
    }),
  },

  kaufland: {
    label: "Kaufland",
    useSyncHook: useSyncToKaufland,
    FormFields: KauflandFormFields,
    buildPayload: (product, values): syncToKauflandInput => ({
      ean: product.ean,
      title: values.title ?? product.name,
      description: values.description ?? product.description,
      image_urls:
        product.static_files?.map((f) => f.url.replace(/\s+/g, "%20")) ?? [],
      price: values.price ?? product.final_price,
      stock: product.stock,
      carrier: product.carrier,
      sku: product.sku,
      product_id: product.id_provider,
    }),
  },
};
