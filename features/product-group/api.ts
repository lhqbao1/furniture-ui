import { apiAdmin, apiPublic } from "@/lib/axios";
import {
  ProductGroupDetailResponse,
  ProductGroupResponse,
} from "@/types/product-group";
import { ProductItem } from "@/types/products";

export async function createProductGroup(name: string) {
  const { data } = await apiAdmin.post(
    "/parent/",
    { name },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
    },
  );
  return data as ProductGroupResponse;
}

export async function getProductGroup() {
  const { data } = await apiPublic.get("/parent/", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true, // nếu backend cần cookie/session
  });
  return data as ProductGroupResponse[];
}

export async function getAllProductsSelect({
  search,
  is_customer = false,
  all_products,
  is_econelo,
  supplier_id,
  brand_id,
  sort_by_stock,
  sort_by_incoming_stock,
  sort_by_marketplace,
  is_inventory,
}: {
  search?: string;
  is_customer?: boolean;
  all_products?: boolean | null;
  is_econelo?: boolean;
  supplier_id?: string | null;
  brand_id?: string | null;
  sort_by_stock?: "asc" | "desc" | string;
  sort_by_incoming_stock?: "asc" | "desc" | string;
  sort_by_marketplace?: string;
  is_inventory?: string;
}) {
  const { data } = await apiPublic.get("/products/all", {
    params: {
      ...(search !== undefined ? { search } : {}),
      is_customer,
      all_products,
      is_econelo,
      ...(supplier_id !== undefined && supplier_id !== null
        ? { supplier_id }
        : {}),
      ...(brand_id !== undefined && brand_id !== null ? { brand_id } : {}),
      ...(sort_by_stock ? { sort_by_stock } : {}),
      ...(sort_by_incoming_stock ? { sort_by_incoming_stock } : {}),
      ...(sort_by_marketplace ? { sort_by_marketplace } : {}),
      ...(is_inventory ? { is_inventory } : {}),
    },
    headers: {
      "Content-Type": "application/json",
    },
  });

  return data as ProductItem[];
}

export async function getProductGroupDetail(parent_id: string) {
  const { data } = await apiPublic.get(`/parent/details/${parent_id}`);
  return data as ProductGroupDetailResponse;
}

export async function updateProductGroup(name: string, id: string) {
  const { data } = await apiAdmin.put(
    `/parent/${id}`,
    { name },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true, // nếu backend cần cookie/session
    },
  );
  return data as ProductGroupResponse;
}

export async function deleteProductGroup(parent_id: string) {
  const { data } = await apiAdmin.delete(`/parent/${parent_id}`);
  return data;
}
