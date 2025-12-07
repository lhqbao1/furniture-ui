// hooks/useProductData.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/features/products/api";
import { getProductGroupDetail } from "@/features/product-group/api";

export function useProductData(
  productDetailsData?: any,
  parentProductData?: any,
  productId?: string,
) {
  // Product details
  const { data: productDetails, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProductById(productId ?? ""),
    initialData: productDetailsData,
  });

  // Parent product (group)
  const { data: parentProduct, isLoading: isLoadingParent } = useQuery({
    queryKey: ["product-group-detail", productDetailsData.parent_id],
    queryFn: () => getProductGroupDetail(productDetailsData.parent_id ?? ""),
    enabled: !!productDetailsData.parent_id,
    initialData: parentProductData,
  });

  return {
    productDetails,
    parentProduct,
    isLoadingProduct,
    isLoadingParent,
  };
}
