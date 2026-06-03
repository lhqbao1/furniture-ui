import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  checkoutCompleted,
  createAffiliate,
  deleteAffiliate,
  generateAffiliateLink,
  GenerateAffiliateLinkInput,
  getAffiliateById,
  getAffiliateEvents,
  getAffiliateFunnel,
  getAffiliates,
  AffiliateEventType,
  GetAffiliateEventsParams,
  GetAffiliateFunnelParams,
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

export function useGetAffiliateEvents<TType extends AffiliateEventType>(
  affiliateId?: string,
  params: Omit<GetAffiliateEventsParams, "type"> & { type: TType } = {
    type: "click" as TType,
  },
  enabled = true,
) {
  return useQuery({
    queryKey: [
      "affiliate-events",
      affiliateId ?? null,
      params.device ?? null,
      params.country ?? null,
      params.status ?? null,
      params.from_date ?? null,
      params.to_date ?? null,
      params.type ?? null,
      params.page ?? 1,
      params.page_size ?? 8,
    ],
    queryFn: () => getAffiliateEvents(affiliateId!, params),
    enabled: Boolean(affiliateId) && enabled,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useGetAffiliateEventGroups(
  affiliateId?: string,
  params: Omit<GetAffiliateEventsParams, "type"> = {},
  enabled = true,
) {
  const eventTypes: AffiliateEventType[] = [
    "click",
    "page_view",
    "session",
    "order",
    "conversion",
  ];

  return useQueries({
    queries: eventTypes.map((type) => ({
      queryKey: [
        "affiliate-events",
        affiliateId ?? null,
        params.device ?? null,
        params.country ?? null,
        params.status ?? null,
        params.from_date ?? null,
        params.to_date ?? null,
        type,
        params.page ?? 1,
        params.page_size ?? 8,
      ],
      queryFn: () =>
        getAffiliateEvents(affiliateId!, {
          ...params,
          type,
        }),
      enabled: Boolean(affiliateId) && enabled,
      retry: false,
      refetchOnWindowFocus: false,
    })),
  });
}

export function useGetAffiliateFunnel(
  params?: GetAffiliateFunnelParams,
  enabled = true,
) {
  return useQuery({
    queryKey: [
      "affiliate-funnel",
      params?.affiliate_id ?? null,
      params?.from_date ?? null,
      params?.to_date ?? null,
    ],
    queryFn: () => getAffiliateFunnel(params!),
    enabled: Boolean(params?.affiliate_id) && enabled,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useGetAffiliateFunnels(
  affiliateIds: string[],
  params: Omit<GetAffiliateFunnelParams, "affiliate_id"> = {},
  enabled = true,
) {
  return useQueries({
    queries: affiliateIds.map((affiliateId) => ({
      queryKey: [
        "affiliate-funnel",
        affiliateId,
        params.from_date ?? null,
        params.to_date ?? null,
      ],
      queryFn: () =>
        getAffiliateFunnel({
          affiliate_id: affiliateId,
          ...params,
        }),
      enabled: Boolean(affiliateId) && enabled,
      retry: false,
      refetchOnWindowFocus: false,
    })),
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

export function useCheckoutCompleted() {
  return useMutation({
    mutationFn: (main_checkout_id: string) => checkoutCompleted(main_checkout_id),
  });
}
