import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  CreateProduct,
  deleteProduct,
  editProduct,
  generateSEO,
  getAllColor,
  getAllMaterials,
  getAllProducts,
  GetAllProductsParams,
  getProductById,
  getProductByIdProvider,
  getProductByTag,
  getProductsAlgoliaSearch,
  GetProductsSearchParams,
} from "./api";
import { ProductInput } from "@/lib/schema/product";
import { ProductItem, ProductResponse } from "@/types/products";
interface SEOInput {
  title: string;
  description: string;
}
interface GetProductByTagParams {
  is_customer?: boolean;
  is_econelo?: boolean;
}
export function useGetAllProducts({
  page,
  page_size,
  all_products,
  search,
  sort_by_stock,
  is_inventory,
  is_econelo,
  brand,
  sort_by_marketplace,
  supplier_id,
}: GetAllProductsParams = {}) {
  return useQuery({
    queryKey: [
      "products",
      page,
      page_size,
      all_products,
      search,
      sort_by_stock,
      is_inventory,
      is_econelo,
      brand,
      sort_by_marketplace,
      supplier_id,
    ],
    queryFn: () =>
      getAllProducts({
        page,
        page_size,
        all_products,
        search,
        sort_by_stock,
        is_inventory,
        is_econelo,
        brand,
        sort_by_marketplace,
        supplier_id,
      }),
    // placeholderData: keepPreviousData,
    retry: false,
  });
}

export function useProductsAlgoliaSearch(params?: GetProductsSearchParams) {
  return useQuery<ProductResponse>({
    queryKey: [
      "products-algolia-search",
      params?.page,
      params?.page_size,
      params?.query,
      params?.brand,
      params?.is_active,
      params?.brandsKey,
      params?.categoriesKey, // 👈 STRING
      params?.brandsKey, // 👈 STRING
      params?.color,
      params?.colorsKey,
      params?.materials,
      params?.materialsKey,
      params?.is_econelo,
    ],
    queryFn: () => getProductsAlgoliaSearch(params),
    enabled: !!params, // không gọi khi params chưa sẵn sàng
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useGetProductById(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: !!id,
    retry: false,
  });
}

export function useGetProductByIdProvider(id_provider: string) {
  return useQuery({
    queryKey: ["product-by-id-provider", id_provider],
    queryFn: () => getProductByIdProvider(id_provider),
    enabled: !!id_provider,
    retry: false,
  });
}

export function useGetProductByTag(
  tag: string,
  params?: GetProductByTagParams,
) {
  return useQuery({
    queryKey: ["product-by-tag", tag, JSON.stringify(params ?? {})],
    queryFn: () => getProductByTag(tag, params),
    enabled: Boolean(tag),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useAddProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => CreateProduct(input),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useEditProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProductInput }) =>
      editProduct(input, id),
    onSuccess: (res, variables) => {
      qc.invalidateQueries({ queryKey: ["all-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product", variables.id] });
    },
  });
}

export function useGenerateSEO() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SEOInput) => generateSEO(input),
    // onSuccess: (res) => {
    //   qc.invalidateQueries({ queryKey: ["products"] })
    // },
  });
}

export function useGetAllColor(is_econelo?: boolean) {
  return useQuery({
    queryKey: ["colors", is_econelo],
    queryFn: () => getAllColor(is_econelo),
    staleTime: 1000 * 60 * 30, // 30 phút
  });
}

export function useGetAllMaterials(is_econelo?: boolean) {
  return useQuery({
    queryKey: ["materials", is_econelo],
    queryFn: () => getAllMaterials(is_econelo),
    staleTime: 1000 * 60 * 30,
  });
}
