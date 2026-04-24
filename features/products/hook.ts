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
  getAllProductAndSold,
  getAllRevenueInventory,
  getAllMaterials,
  getAllProducts,
  GetAllProductAndSoldParams,
  GetAllRevenueInventoryParams,
  GetAllProductsParams,
  getProductLogs,
  getProductById,
  getProductByIdProvider,
  getProductByTag,
  getProductsAlgoliaSearch,
  GetProductsSearchParams,
  EditProductInput,
  updateBulkActiveProducts,
} from "./api";
import { ProductInput } from "@/lib/schema/product";
import {
  ProductDetailLog,
  ProductAndSoldResponse,
  ProductRevenueInventoryResponse,
  ProductResponse,
} from "@/types/products";
import { toast } from "sonner";
interface SEOInput {
  title: string;
  description: string;
}
interface GetProductByTagParams {
  is_customer?: boolean;
  is_econelo?: boolean;
}

interface BulkActivePayload {
  productIds: string[];
  isActive: boolean;
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
  brand_id,
  sort_by_incoming_stock,
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
      brand_id,
      sort_by_incoming_stock,
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
        brand_id,
        sort_by_incoming_stock,
      }),
    placeholderData: keepPreviousData,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useGetAllProductAndSold({
  search,
  sort_by_stock,
  page,
  page_size,
  is_econelo,
}: GetAllProductAndSoldParams = {}) {
  return useQuery<ProductAndSoldResponse>({
    queryKey: [
      "products-and-sold",
      search,
      sort_by_stock,
      page,
      page_size,
      is_econelo,
    ],
    queryFn: () =>
      getAllProductAndSold({
        search,
        sort_by_stock,
        page,
        page_size,
        is_econelo,
      }),
    placeholderData: keepPreviousData,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useGetAllRevenueInventory({
  search,
  page,
  page_size,
  is_econelo,
}: GetAllRevenueInventoryParams = {}) {
  return useQuery<ProductRevenueInventoryResponse>({
    queryKey: [
      "products-revenue-inventory",
      search,
      page,
      page_size,
      is_econelo,
    ],
    queryFn: () =>
      getAllRevenueInventory({
        search,
        page,
        page_size,
        is_econelo,
      }),
    placeholderData: keepPreviousData,
    retry: false,
    refetchOnWindowFocus: false,
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
    refetchOnWindowFocus: false,
  });
}

export const useUpdateBulkActiveProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productIds, isActive }: BulkActivePayload) =>
      updateBulkActiveProducts(productIds, isActive),

    onSuccess: () => {
      toast.success("Products updated successfully");

      // 🔄 refetch / invalidate product list
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },

    onError: (error: unknown) => {
      const message = (
        error as {
          response?: { data?: { message?: string } };
        }
      )?.response?.data?.message;

      toast.error("Failed to update products", {
        description: message ?? "Please try again later.",
      });
    },
  });
};

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
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

export function useGetProductLogs(productId: string) {
  return useQuery<ProductDetailLog[]>({
    queryKey: ["product-logs", productId],
    queryFn: () => getProductLogs(productId),
    enabled: !!productId,
    retry: false,
    refetchOnWindowFocus: false,
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useEditProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: EditProductInput;
      skipInvalidateProducts?: boolean;
    }) =>
      editProduct(input, id),
    onSuccess: (_, variables) => {
      if (!variables.skipInvalidateProducts) {
        qc.invalidateQueries({ queryKey: ["all-products"] });
        qc.invalidateQueries({ queryKey: ["products"] });
        qc.invalidateQueries({ queryKey: ["product", variables.id] });
      }
    },
  });
}

export function useGenerateSEO() {
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
