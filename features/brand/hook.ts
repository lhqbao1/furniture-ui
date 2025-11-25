import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BrandFormValues } from "@/lib/schema/brand";
import { BrandInput, BrandResponse } from "@/types/brand";
import { getBrand, createBrand, deleteBrand, editBrand } from "./api";

// --- GET ALL BRANDS ---
export function useGetBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: () => getBrand(),
    retry: false,
  });
}

// --- CREATE BRAND ---
export function useCreateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BrandInput) => createBrand(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}

// --- EDIT BRAND ---
export function useEditBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: BrandInput }) =>
      editBrand(input, id),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["brands"] });
      qc.invalidateQueries({ queryKey: ["brand", variables.id] });
    },
  });
}

// --- DELETE BRAND ---
export function useDeleteBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBrand(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}
