import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProductGroup,
  deleteProductGroup,
  getAllProductsSelect,
  getProductGroup,
  getProductGroupDetail,
  updateProductGroup,
} from "./api";

export function useGetProductGroup() {
  return useQuery({
    queryKey: ["product-group"],
    queryFn: () => getProductGroup(),
    retry: false,
  });
}

export function useGetProductsSelect(params?: {
  search?: string;
  is_customer?: boolean;
  all_products?: boolean;
  is_econelo?: boolean;
  supplier_id?: string;
}) {
  return useQuery({
    queryKey: [
      "all-products",
      params?.search,
      params?.is_customer,
      params?.all_products,
      params?.is_econelo,
      params?.supplier_id,
    ],
    queryFn: () => getAllProductsSelect(params ?? {}),
  });
}

export function useGetProductGroupDetail(parent_id: string) {
  return useQuery({
    queryKey: ["product-group-detail", parent_id],
    queryFn: () => getProductGroupDetail(parent_id),
    enabled: !!parent_id,
  });
}

export function useAddProductGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createProductGroup(name),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["product-group"] });
      qc.invalidateQueries({ queryKey: ["product-group-detail"] });
    },
  });
}

export function useUpdateProductGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, id }: { name: string; id: string }) =>
      updateProductGroup(name, id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["product-group"] });
      qc.invalidateQueries({ queryKey: ["product-group-detail"] });
    },
  });
}

export function useDeleteProductGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProductGroup(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["product-group"] });
      qc.invalidateQueries({ queryKey: ["product-group-detail"] });
    },
  });
}
