import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AddOrRemoveProductToCategoryInput,
  CategoryInput,
  CategoryResponse,
} from "@/types/categories";
import {
  addProductToCategory,
  createCategory,
  deleteCategory,
  editCategory,
  getCategories,
  getCategoriesWithChildren,
  getCategoryById,
  getCategoryByName,
  getChildrenCategoryByParent,
  removeProductFromCategory,
} from "./api";

// --- GET ALL CATEGORIES ---
export function useGetCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
    retry: false,
  });
}

export function useGetCategoriesWithChildren() {
  return useQuery({
    queryKey: ["categories-with-children"],
    queryFn: () => getCategoriesWithChildren(),
    retry: false,
  });
}

// --- GET CATEGORY BY ID ---
export function useGetCategoryById(id: string) {
  return useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategoryById(id),
    enabled: !!id,
    retry: false,
  });
}

// --- CREATE CATEGORY ---
export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryInput) => createCategory(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["categories-with-children"] });
    },
  });
}

// --- EDIT CATEGORY ---
export function useEditCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CategoryInput }) =>
      editCategory(input, id),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["category", variables.id] });
      qc.invalidateQueries({ queryKey: ["categories-with-children"] });
    },
  });
}

// --- DELETE CATEGORY ---
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-with-children"] });
    },
  });
}

// --- ADD PRODUCT TO CATEGORY ---
export function useAddProductToCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      input,
      categoryId,
    }: {
      input: AddOrRemoveProductToCategoryInput;
      categoryId: string;
    }) => addProductToCategory(input, categoryId),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ["category", variables.categoryId] });
      qc.invalidateQueries({ queryKey: ["categories-with-children"] });
    },
  });
}

// --- REMOVE PRODUCT FROM CATEGORY ---
export function useRemoveProductFromCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      input,
      categoryId,
    }: {
      input: AddOrRemoveProductToCategoryInput;
      categoryId: string;
    }) => removeProductFromCategory(input, categoryId),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ["category", variables.categoryId] });
      qc.invalidateQueries({ queryKey: ["categories-with-children"] });
    },
  });
}

export function useGetCategoryByName(params?: string) {
  return useQuery({
    queryKey: ["category-by-name", params],
    queryFn: () => getCategoryByName(params),
  });
}

export function useGetChildrenCategoriesByParent(slug: string) {
  return useQuery({
    queryKey: ["category-children", slug],
    queryFn: () => getChildrenCategoryByParent(slug),
  });
}
