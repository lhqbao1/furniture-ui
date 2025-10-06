import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CreateProductDSP, getAllProductsDSP } from "./api"
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