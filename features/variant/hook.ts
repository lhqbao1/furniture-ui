// src/features/variant/hooks.ts
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getVariants,
  getVariantById,
  getVariantOptionByVariant,
  createVariant,
  deleteVariant,
  addOptionToProduct,
  createVariantOption,
  deleteVariantOption,
} from "@/features/variant/api"
import {
  AddOptionToProductInput,
  VariantOption,
  VariantOptionInput,
  VariantOptionsResponse,
  VariantResponse,
} from "@/types/variant"

// GET all variants
export function useGetVariants() {
  return useQuery({
    queryKey: ["variants"],
    queryFn: () => getVariants(),
  })
}

// GET variant by id
export function useGetVariantById(id: string) {
  return useQuery<VariantResponse>({
    queryKey: ["variant", id],
    queryFn: () => getVariantById(id),
    enabled: !!id,
  })
}

// GET variant options by variant name
export function useGetVariantOptionByVariant(name: string) {
  return useQuery<VariantOption[]>({
    queryKey: ["variant-options", name],
    queryFn: () => getVariantOptionByVariant(name),
    enabled: !!name,
  })
}

// CREATE variant
export function useCreateVariant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ parent_id, name }: { parent_id: string; name: string }) =>
      createVariant(parent_id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants"] })
      queryClient.invalidateQueries({ queryKey: ["product-group-detail"] })
    },
  })
}

// DELETE variant
export function useDeleteVariant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants"] })
      queryClient.invalidateQueries({ queryKey: ["product-group-detail"] })
    },
  })
}

// DELETE variant option
export function useDeleteVariantOption() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteVariantOption(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants"] })
      queryClient.invalidateQueries({ queryKey: ["product-group-detail"] })
    },
  })
}

// ADD option to product
export function useAddOptionToProduct() {
  return useMutation({
    mutationFn: (input: AddOptionToProductInput) => addOptionToProduct(input),
  })
}

// CREATE variant option
export function useCreateVariantOption() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      variant_id,
      input,
    }: {
      variant_id: string
      input: VariantOptionInput
    }) => createVariantOption(variant_id, input),
    onSuccess: (data: VariantOptionsResponse) => {
      queryClient.invalidateQueries({ queryKey: ["variant-options", data.variant.name] })
      queryClient.invalidateQueries({ queryKey: ["product-group-detail"] })
    },
  })
}
