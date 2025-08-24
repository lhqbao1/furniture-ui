import { useMutation } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { z } from "zod"
import {  Products } from "@/lib/schema/product"


export function useCreateProduct() {
  return useMutation({
    mutationFn: async (data: Products) => {
      const res = await api.post("/products", data)
      return res.data
    },
  })
}
