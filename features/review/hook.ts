import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReviewFormValues } from "@/lib/schema/review";
import { ReviewResponse } from "@/types/review";
import { createReview, deleteReview, getReviewByCustomer, getReviewByProduct } from "./api";

// --- GET REVIEW BY PRODUCT ---
export function useGetReviewsByProduct(product_id: string) {
  return useQuery({
    queryKey: ["reviews", "product", product_id],
    queryFn: () => getReviewByProduct(product_id),
    enabled: !!product_id, // chỉ chạy khi có id
    retry: false,
  });
}

// --- GET REVIEW BY CUSTOMER ---
export function useGetReviewsByCustomer(customer_id: string) {
  return useQuery({
    queryKey: ["reviews", "customer", customer_id],
    queryFn: () => getReviewByCustomer(customer_id),
    enabled: !!customer_id,
    retry: false,
  });
}

// --- CREATE REVIEW ---
export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ReviewFormValues) => createReview(input),
    onSuccess: (_, variables) => {
      // invalidate list theo product_id để cập nhật UI
      qc.invalidateQueries({
        queryKey: ["reviews", "product", variables.product_id],
      });
    },
  });
}

// --- DELETE REVIEW ---
export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (review_id: string) => deleteReview(review_id),
    onSuccess: (_, review_id) => {
      // có thể invalidate toàn bộ reviews
      qc.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}
