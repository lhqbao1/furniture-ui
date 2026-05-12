import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCheckoutMainTag,
  CreateCheckoutMainTagInput,
  deleteCheckoutMainTag,
  getCheckoutMainTags,
  updateCheckoutMainTag,
  UpdateCheckoutMainTagInput,
} from "./api";

export function useGetCheckoutMainTags(enabled = true) {
  return useQuery({
    queryKey: ["checkout-main-tags"],
    queryFn: getCheckoutMainTags,
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateCheckoutMainTag() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCheckoutMainTagInput) =>
      createCheckoutMainTag(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checkout-main-tags"] });
    },
  });
}

export function useDeleteCheckoutMainTag() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (tagId: string) => deleteCheckoutMainTag(tagId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checkout-main-tags"] });
      qc.invalidateQueries({ queryKey: ["checkout-main-id"] });
      qc.invalidateQueries({ queryKey: ["checkout-main"] });
      qc.invalidateQueries({ queryKey: ["checkout"] });
    },
  });
}

export function useUpdateCheckoutMainTag() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      mainCheckoutId,
      tags,
    }: {
      mainCheckoutId: string;
      tags: UpdateCheckoutMainTagInput;
    }) => updateCheckoutMainTag(mainCheckoutId, tags),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: ["checkout-main-id", variables.mainCheckoutId],
      });
      qc.invalidateQueries({ queryKey: ["checkout-main"] });
      qc.invalidateQueries({ queryKey: ["checkout"] });
    },
  });
}
