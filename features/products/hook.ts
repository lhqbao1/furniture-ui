import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CreateProduct, deleteProduct, editProduct, getAllProducts, getProductById, getProductByTag } from "./api"
import { ProductInput } from "@/lib/schema/product"

interface UseGetAllProductsParams {
  page?: number
  page_size?: number
  all_products?: boolean
}

export function useGetAllProducts({ page, page_size, all_products }: UseGetAllProductsParams = {}) {
  return useQuery({
    queryKey: ["products", page, page_size, all_products], // queryKey thay đổi khi page/page_size thay đổi
    queryFn: () => getAllProducts({ page, page_size, all_products }),
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

export function useGetProductByTag(tag: string) {
  return useQuery({
    queryKey: ["product-by-tag", tag],
    queryFn: () => getProductByTag(tag),
    enabled: !!tag,
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

  
