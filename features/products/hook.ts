import { Products } from "@/lib/schema/product"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CreateProduct, deleteProduct, editProduct, getAllProducts, getProductById } from "./api"
import { ProductItem, ProductResponse } from "@/types/products"

export function useGetAllProducts(){
    return useQuery({
       queryKey: ["products"],
       queryFn: () => getAllProducts(),
       retry: false,
      //  initialData
      //  staleTime: 60_000
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

export function useAddProduct() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (input: Products) => CreateProduct(input),
      onSuccess: (res) => {
        qc.invalidateQueries({ queryKey: ["products"] })
      },
    })
}

export function useEditProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProductItem }) => editProduct(input, id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["products"] })
    },
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