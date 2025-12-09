import { api, apiAdmin, apiPublic } from "@/lib/axios";
import { ProductInput } from "@/lib/schema/product";
import { ProductItem, ProductResponse } from "@/types/products";

export interface GetAllProductsParams {
  page?: number;
  page_size?: number;
  all_products?: string;
  search?: string;
  is_inventory?: boolean;
  sort_by_stock?: string;
}

interface SEOInput {
  title: string;
  description: string;
}

interface SEOResponse {
  url_key: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

export async function CreateProduct(input: ProductInput) {
  const { data } = await apiAdmin.post("/products/", input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });
  return data as ProductItem;
}

export async function getAllProducts(params?: GetAllProductsParams) {
  const { data } = await apiPublic.get("/products/", {
    params: {
      ...(params?.page !== undefined && { page: params.page }),
      ...(params?.page_size !== undefined && { page_size: params.page_size }),
      ...(params?.all_products !== undefined && {
        all_products: params.all_products,
      }),
      ...(params?.search !== undefined && { search: params.search }),
      ...(params?.is_inventory !== undefined && {
        is_inventory: params.is_inventory,
      }),
      ...(params?.sort_by_stock && { sort_by_stock: params.sort_by_stock }),
    },
  });

  return data as ProductResponse;
}

export async function getProductsFeed() {
  const { data } = await apiPublic.get(`/products/all-product`);
  return data as ProductItem[];
}

export async function getProductById(id: string) {
  const { data } = await apiPublic.get(`/products/details/${id}`);
  return data as ProductItem;
}

export async function getProductBySlug(product_slug: string) {
  try {
    const { data } = await apiPublic.get(`/products/by-slug/${product_slug}`);
    return data as ProductItem;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // ⭐ Trả null khi slug không tồn tại
    }
    throw error; // lỗi khác thì throw để debug
  }
}

export async function getProductByTag(tag: string, is_customer = false) {
  try {
    const { data } = await apiPublic.get(`/products/by-tag/${tag}`, {
      params: { is_customer },
    });
    return data as ProductItem[];
  } catch (err) {
    console.error("API getProductByTag failed:", tag, err);
    return []; // ⭐ KHÔNG THROW → KHÔNG CRASH SSR
  }
}

export async function deleteProduct(id: string) {
  const { data } = await apiAdmin.delete(`/products/${id}`);
  return data;
}

export async function editProduct(input: ProductInput, id: string) {
  const { data } = await apiAdmin.put(`/products/${id}`, input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true, // nếu backend cần cookie/session
  });
  return data as ProductItem;
}

export async function generateSEO(input: SEOInput) {
  const { data } = await apiAdmin.post(
    "/products/ai-generate-metadata",
    input,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
    },
  );
  return data as SEOResponse;
}
