import { api, apiAdmin, apiPublic } from "@/lib/axios";
import { ReviewFormValues } from "@/lib/schema/review";
import { ReviewResponse } from "@/types/review";

export async function createReview(input: ReviewFormValues) {
  const { data } = await api.post("/review/", input, {
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
  });
  return data;
}

export const getReviewByProduct = async (product_id: string) => {
  try {
    const { data } = await api.get(`/review/review-product/${product_id}`);
    return data as ReviewResponse[];
  } catch (err: any) {
    // Nếu API trả về 404 ⇒ không có review
    if (err?.response?.status === 404) {
      return [] as ReviewResponse[];
    }

    // Các lỗi khác: ném lỗi
    throw err;
  }
};

export const getReviewByCustomer = async (customer_id: string) => {
  const { data } = await api.get(`/review/review-customer/${customer_id}`);
  return data as ReviewResponse[];
};

export async function deleteReview(review_id: string) {
  const { data } = await apiAdmin.delete(`/review/${review_id}`);
  return data;
}
