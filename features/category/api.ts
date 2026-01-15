import { api, apiAdmin, apiPublic } from "@/lib/axios";
import {
  AddOrRemoveProductToCategoryInput,
  CategoryByIdResponse,
  CategoryBySlugResponse,
  CategoryInput,
  CategoryResponse,
  ListCategoryChildrenNameByParent,
} from "@/types/categories";
import { ProductItem } from "@/types/products";
import { cache } from "react";

export interface GetCategoryParams {
  product_name?: string;
  page?: number;
  page_size?: number;
}

export async function getCategories() {
  const { data } = await apiPublic.get("/categories/");
  return data as CategoryResponse[];
}

export async function getCategoriesWithChildren() {
  const { data } = await apiPublic.get("/categories/cat_have_products");
  return data as CategoryResponse[];
}

export async function serverGetCategories(): Promise<CategoryResponse[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}categories/`,
    {
      next: { revalidate: 3600 }, // revalidate mỗi 1 giờ
      cache: "force-cache", // hoặc "no-store" nếu luôn cần fresh
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  return res.json();
}

export async function getCategoryById(id: string) {
  const { data } = await apiPublic.get(`/categories/details/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true, // nếu backend cần cookie/session
  });
  return data as CategoryByIdResponse;
}

export async function getCategoryBySlug(
  category_slug: string,
  params?: GetCategoryParams,
) {
  const { data } = await apiPublic.get(`/categories/slug/${category_slug}`, {
    headers: {
      "Content-Type": "application/json",
    },
    params: {
      product_name: params?.product_name,
      page: params?.page ?? 1,
      page_size: params?.page_size ?? 8,
    },
  });
  return data as CategoryBySlugResponse;
}

export async function getCategoryByName(params?: string) {
  const { data } = await apiPublic.get(`/categories/by-name`, {
    params: params ? { category_name: String(params) } : {},
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true, // nếu backend cần cookie/session
  });
  return data as ProductItem[];
}

export async function createCategory(input: CategoryInput) {
  const { data } = await apiAdmin.post("/categories/", input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });
  return data as CategoryResponse;
}

export async function addProductToCategory(
  input: AddOrRemoveProductToCategoryInput,
  category_id: string,
) {
  const { data } = await apiAdmin.post(
    `/categories/add-product/${category_id}`,
    input,
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

export async function removeProductFromCategory(
  input: AddOrRemoveProductToCategoryInput,
  category_id: string,
) {
  const { data } = await apiAdmin.post(
    `/categories/remove-product/${category_id}`,
    input,
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

export async function editCategory(input: CategoryInput, id: string) {
  const { data } = await apiAdmin.put(`/categories/${id}`, input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true, // nếu backend cần cookie/session
  });
  return data;
}

export async function deleteCategory(id: string) {
  const { data } = await apiAdmin.delete(`/categories/${id}`);
  return data;
}

export async function getChildrenCategoryByParent(category_slug: string) {
  const { data } = await apiPublic.get(`/categories/child/${category_slug}`);
  return data as ListCategoryChildrenNameByParent;
}
