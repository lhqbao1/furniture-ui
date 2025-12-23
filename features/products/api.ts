import { api, apiAdmin, apiPublic } from "@/lib/axios";
import { ProductInput } from "@/lib/schema/product";
import { KeywordResponse } from "@/types/keyword";
import { ProductItem, ProductResponse } from "@/types/products";
import qs from "qs";

export interface GetAllProductsParams {
  page?: number;
  page_size?: number;
  all_products?: string;
  search?: string;
  is_inventory?: string;
  sort_by_stock?: string;
  is_econelo?: boolean;
  brand?: string;
  sort_by_marketplace?: string;
}

export type GetProductsSearchParams = {
  query?: string;
  page?: number;
  page_size?: number;
  is_active?: boolean;
  brand?: string[];
  categories?: string[];
  color?: string[];
  materials?: string[];
  delivery_time?: string[];
  price_min?: number;
  price_max?: number;
  is_econelo?: boolean;
  categoriesKey?: string;
  brandsKey?: string;
  colorsKey?: string;
  materialsKey?: string;
  delivery_timeKey?: string;
};

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
      ...(params?.sort_by_marketplace && {
        sort_by_marketplace: params.sort_by_marketplace,
      }),

      ...(params?.is_econelo !== undefined && {
        is_econelo: params.is_econelo,
        brand: params.brand,
      }),
    },
  });

  return data as ProductResponse;
}

export async function getProductsAlgoliaSearch(
  params?: GetProductsSearchParams,
) {
  const { data } = await apiPublic.get("/products/algolia/search", {
    params: {
      ...(params?.query && { query: params.query }),
      ...(params?.page && { page: params.page }),
      ...(params?.page_size && { page_size: params.page_size }),
      ...(params?.is_active !== undefined && { is_active: params.is_active }),
      ...(params?.brand && { brand: params.brand }),
      ...(params?.categories && { categories: params.categories }), // 👈 array
      ...(params?.color && { color: params.color }),
      ...(params?.materials && { materials: params.materials }),
      ...(params?.delivery_time && { delivery_time: params.delivery_time }),
      ...(params?.price_min !== undefined && { price_min: params.price_min }),
      ...(params?.price_max !== undefined && { price_max: params.price_max }),
    },
    paramsSerializer: (params) =>
      qs.stringify(params, {
        arrayFormat: "repeat", // 👈 QUAN TRỌNG
        encodeValuesOnly: true,
      }),
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

export async function getProductByTag(
  tag: string,
  is_customer = false,
  is_econelo = false,
) {
  try {
    const { data } = await apiPublic.get(`/products/by-tag/${tag}`, {
      params: { is_customer, is_econelo },
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

export async function getAllKeywords() {
  const { data } = await apiPublic.get("/products/get-all-key-work");
  return data as KeywordResponse[];
}

export async function getAllColor(is_econelo?: boolean) {
  const { data } = await apiPublic.get("/products/get-all-color", {
    params: {
      ...(is_econelo !== undefined && { is_econelo }),
    },
  });

  return data as string[];
}

export async function getAllMaterials(is_econelo?: boolean) {
  const { data } = await apiPublic.get("/products/get-all-material", {
    params: {
      ...(is_econelo !== undefined && { is_econelo }),
    },
  });

  return data as string[];
}
