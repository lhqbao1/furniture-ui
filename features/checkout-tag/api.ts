import { apiAdmin } from "@/lib/axios";
import { CheckoutMainTag } from "@/types/checkout";

export interface CreateCheckoutMainTagInput {
  tag: string;
  code: string;
}

export type UpdateCheckoutMainTagInput = string[];

export async function getCheckoutMainTags() {
  const { data } = await apiAdmin.get("/checkout/tag-main-checkout");
  return data as CheckoutMainTag[];
}

export async function createCheckoutMainTag(input: CreateCheckoutMainTagInput) {
  const { data } = await apiAdmin.post("/checkout/create-tag", input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data as CheckoutMainTag;
}

export async function deleteCheckoutMainTag(tagId: string) {
  const { data } = await apiAdmin.delete(
    `/checkout/delete-tag-main-checkout/${tagId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
    },
  );

  return data as CheckoutMainTag;
}

export async function updateCheckoutMainTag(
  mainCheckoutId: string,
  tags: UpdateCheckoutMainTagInput,
) {
  const { data } = await apiAdmin.put(
    `/checkout/update-tag-main-checkout/${mainCheckoutId}`,
    tags,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
    },
  );

  return data;
}
