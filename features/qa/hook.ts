import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createQA, deleteQA, getQAByCustomer, getQAByProduct } from "./api";
import { QAFormValues } from "@/lib/schema/qa";

// --- GET QA BY PRODUCT ---
export function useGetQAByProduct(product_id: string) {
  return useQuery({
    queryKey: ["qa", "product", product_id],
    queryFn: () => getQAByProduct(product_id),
    enabled: !!product_id,
    retry: 1,
  });
}

// --- GET QA BY CUSTOMER ---
export function useGetQAByCustomer(customer_id: string) {
  return useQuery({
    queryKey: ["qa", "customer", customer_id],
    queryFn: () => getQAByCustomer(customer_id),
    enabled: !!customer_id,
    retry: false,
  });
}

// --- CREATE REVIEW ---
export function useCreateQA() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: QAFormValues) => createQA(input),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ["qa", "product", variables.product_id],
      });
    },
  });
}

// --- DELETE REVIEW ---
export function useDeleteQA() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (forum_id: string) => deleteQA(forum_id),
    onSuccess: (_, forum_id) => {
      qc.invalidateQueries({ queryKey: ["qa"] });
    },
  });
}
