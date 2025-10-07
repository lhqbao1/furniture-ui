import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CreateProductDSP, deleteProductDSP, editProductDSP, getAllProductsDSP, getProductByIdDSP } from "./api"
import { ProductInput } from "@/lib/schema/product"

interface UseGetAllProductsParams {
    page?: number
    page_size?: number
    all_products?: boolean
    search?: string
}

export function useGetAllProductsDSP({ page, page_size, all_products, search }: UseGetAllProductsParams = {}) {
    return useQuery({
      queryKey: ["dsp-products", page, page_size, all_products, search], // queryKey thay đổi khi page/page_size thay đổi
      queryFn: () => getAllProductsDSP({ page, page_size, all_products,search }),
      retry: false,
    })
}

export function useAddProductDSP() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (input: ProductInput) => CreateProductDSP(input),
      onSuccess: (res) => {
        qc.invalidateQueries({ queryKey: ["dsp-products"] })
      },
    })
}

export function useDeleteProductDSP(){
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (product_id: string) => deleteProductDSP(product_id),
    onSuccess(data, variables, context) {
        qc.invalidateQueries({queryKey: ['dsp-products']})
    }, 
  })
}

export function useGetProductByIdDSP(product_id: string) {
  return useQuery({
    queryKey: ["dsp-product", product_id],
    queryFn: () => getProductByIdDSP(product_id),
    enabled: !!product_id,
    retry: false,
  })
}

export function useEditProductDSP() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ product_id, input }: { product_id: string; input: ProductInput }) => editProductDSP(input, product_id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["dsp-products"] })
    },
  })
}