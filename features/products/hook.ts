import { Products } from "@/lib/schema/product"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CreateProduct, getAllProducts } from "./api"

export function useGetAllProducts(){
    return useQuery({
       queryKey: ["products"],
       queryFn: getAllProducts,
       retry: false,
     })
}

export function useAddProduct() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (input: Products) => CreateProduct(input),
      onSuccess: (res) => {
        qc.invalidateQueries({ queryKey: ["products"] })
      },
    })
}

  