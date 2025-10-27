import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CreateProduct, deleteProduct, editProduct, generateSEO, getAllProducts, GetAllProductsParams, getProductById, getProductByTag } from "./api"
import { ProductInput } from "@/lib/schema/product"
interface SEOInput {
  title: string
  description: string
}

export function useGetAllProducts({ page, page_size, all_products, search, sort_by_stock }: GetAllProductsParams = {}) {
  return useQuery({
    queryKey: ["products", page, page_size, all_products, search, sort_by_stock], // queryKey thay đổi khi page/page_size thay đổi
    queryFn: () => getAllProducts({ page, page_size, all_products,search ,sort_by_stock}),
    // placeholderData: keepPreviousData,
    retry: false,
  })
}

export function useDeleteProduct(){
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

export function useGetProductById(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: !!id,
    retry: false,
  })
}

export function useGetProductByTag(tag: string, is_customer = false) {
  return useQuery({
    queryKey: ["product-by-tag", tag, is_customer],
    queryFn: () => getProductByTag(tag, is_customer),
    enabled: !!tag, // chỉ gọi khi tag có giá trị
    retry: false,
  })
}

export function useAddProduct() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (input: ProductInput) => CreateProduct(input),
      onSuccess: (res) => {
        qc.invalidateQueries({ queryKey: ["products"] })
      },
    })
}

export function useEditProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProductInput }) => editProduct(input, id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

export function useGenerateSEO() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: SEOInput) => generateSEO(input),
    // onSuccess: (res) => {
    //   qc.invalidateQueries({ queryKey: ["products"] })
    // },
  })
}