import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRelatedProducts,
  deleteRelatedProduct,
  getRelatedProducts,
} from "./api";
import { RelatedProductFormValues } from "@/src/app/[locale]/(admin)/admin/products/related/page";

export const relatedProductKeys = {
  all: ["related-products"] as const,
  byProduct: (id: string) => [...relatedProductKeys.all, id] as const,
};

export function useGetRelatedProducts(product_id: string) {
  return useQuery({
    queryKey: ["related-product-by-id", product_id],
    queryFn: () => getRelatedProducts(product_id),
    enabled: !!product_id,
  });
}

export function useCreateRelatedProducts() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: RelatedProductFormValues) =>
      createRelatedProducts(input),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["related-product-by-id"],
      });
    },
  });
}

export function useDeleteRelatedProduct(product_id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteRelatedProduct,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: relatedProductKeys.byProduct(product_id),
      });
    },
  });
}
