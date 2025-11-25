import { api, apiAdmin, apiFlexible } from "@/lib/axios";
import {
  AddOptionToProductInput,
  VariantOption,
  VariantOptionInput,
  VariantOptionsResponse,
  VariantResponse,
} from "@/types/variant";

export async function getVariants() {
  const { data } = await apiAdmin.get("/variants/", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true, // nếu backend cần cookie/session
  });
  return data;
}

export async function getVariantById(id: string) {
  const { data } = await apiAdmin.get(`/variants/${id}`);
  return data as VariantResponse;
}

export async function getVariantOptionByVariant(name: string) {
  const { data } = await apiAdmin.get(`/variants/${name}/options`);
  return data as VariantOption[];
}

export async function createVariant(
  parent_id: string,
  name: string,
  is_img?: boolean,
) {
  const { data } = await apiAdmin.post(
    `/variants/${parent_id}`,
    { name, is_img },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
    },
  );
  return data as VariantResponse;
}

export async function deleteVariant(id: string) {
  const { data } = await apiAdmin.delete(`/variants/${id}`);
  return data;
}

export async function deleteVariantOption(option_id: string) {
  const { data } = await apiAdmin.delete(`/variants/options/${option_id}`);
  return data;
}

export async function addOptionToProduct(input: AddOptionToProductInput) {
  const { data } = await apiAdmin.post(
    `/variants/parent/add-option-to-product`,
    JSON.stringify(input), // stringify tay
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

export async function createVariantOption(
  variant_id: string,
  input: VariantOptionInput,
) {
  const { data } = await apiAdmin.post(
    `/variants/${variant_id}/options`,
    input,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
    },
  );
  return data as VariantOptionsResponse;
}
