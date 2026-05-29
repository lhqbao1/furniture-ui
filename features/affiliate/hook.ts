import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAffiliate,
  deleteAffiliate,
  generateAffiliateLink,
  GenerateAffiliateLinkInput,
  getAffiliateById,
  getAffiliates,
  trackAffiliateClick,
  trackAffiliateOrder,
  trackAffiliatePageView,
  TrackAffiliateClickInput,
  TrackAffiliateOrderInput,
  TrackAffiliatePageViewInput,
  updateAffiliate,
} from "./api";
import { AffiliateCreateInput, AffiliateUpdateInput } from "@/types/affiliate";

export function useGetAffiliates(enabled = true) {
  return useQuery({
    queryKey: ["affiliates"],
    queryFn: getAffiliates,
    enabled,
    retry: false,
  });
}

export function useGetAffiliateById(id?: string) {
  return useQuery({
    queryKey: ["affiliate", id],
    queryFn: () => getAffiliateById(id!),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useCreateAffiliate() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: AffiliateCreateInput) => createAffiliate(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["affiliates"] });
    },
  });
}

export function useUpdateAffiliate() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AffiliateUpdateInput }) =>
      updateAffiliate(id, input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["affiliates"] });
      qc.invalidateQueries({ queryKey: ["affiliate", variables.id] });
    },
  });
}

export function useDeleteAffiliate() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAffiliate(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["affiliates"] });
      qc.invalidateQueries({ queryKey: ["affiliate", id] });
    },
  });
}

export function useGenerateAffiliateLink() {
  return useMutation({
    mutationFn: (input: GenerateAffiliateLinkInput) =>
      generateAffiliateLink(input),
  });
}

export function useTrackAffiliateClick() {
  return useMutation({
    mutationFn: (input: TrackAffiliateClickInput) => trackAffiliateClick(input),
  });
}

export function useTrackAffiliatePageView() {
  return useMutation({
    mutationFn: (input: TrackAffiliatePageViewInput) =>
      trackAffiliatePageView(input),
  });
}

export function useTrackAffiliateOrder() {
  return useMutation({
    mutationFn: (input: TrackAffiliateOrderInput) => trackAffiliateOrder(input),
  });
}
