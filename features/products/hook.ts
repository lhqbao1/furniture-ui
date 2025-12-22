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

export function useGetAllProducts({
  page,
  page_size,
  all_products,
  search,
  sort_by_stock,
  is_inventory,
  is_econelo,
  brand,
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
      }),
    // placeholderData: keepPreviousData,
    retry: false,
  });
}

export function useProductsAlgoliaSearch(params?: GetProductsSearchParams) {
  return useQuery<ProductResponse>({
    queryKey: ["products-algolia-search", params],
    queryFn: () => getProductsAlgoliaSearch(params),
    enabled: !!params, // không gọi khi params chưa sẵn sàng
    staleTime: 60 * 1000, // 1 phút
    gcTime: 5 * 60 * 1000, // cache 5 phút (react-query v5)
    retry: 1,
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

export function useGetProductByTag(
  tag: string,
  is_customer = false,
  is_econelo = false,
) {
  return useQuery({
    queryKey: ["product-by-tag", tag, is_customer, is_econelo],
    queryFn: () => getProductByTag(tag, is_customer, is_econelo),
    enabled: !!tag, // chỉ gọi khi tag có giá trị
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
