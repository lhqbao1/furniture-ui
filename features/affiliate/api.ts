import { apiAdmin, apiPublic } from "@/lib/axios";
import {
  AffiliateCreateInput,
  AffiliateOwnerResponse,
  AffiliateResponse,
  AffiliateUpdateInput,
} from "@/types/affiliate";

export interface GenerateAffiliateLinkInput {
  affiliate_id: string;
  expire_in?: number;
}

export interface TrackAffiliateClickInput {
  aff?: string | null;
  utm_source?: string | null;
  landing_page?: string | null;
}

export interface TrackAffiliateClickResponse {
  message?: string;
  [key: string]: unknown;
}

export interface TrackAffiliatePageViewInput {
  url: string;
  time_spent: number;
}

export interface TrackAffiliatePageViewResponse {
  message?: string;
  [key: string]: unknown;
}

export interface TrackAffiliateOrderInput {
  checkout_id: string;
  status: string;
  user_id: string;
  total_discount: number;
  total_amount: number;
}

export interface TrackAffiliateOrderResponse {
  message?: string;
  [key: string]: unknown;
}

export interface CheckoutCompletedResponse {
  message?: string;
  [key: string]: unknown;
}

export interface GetAffiliateEventsParams {
  device?: string;
  country?: string;
  status?: string;
  from_date?: string;
  to_date?: string;
  type?: AffiliateEventType;
  page?: number;
  page_size?: number;
}

export interface GetAffiliateFunnelParams {
  affiliate_id: string;
  from_date?: string;
  to_date?: string;
}

export type AffiliateEventType =
  | "click"
  | "page_view"
  | "session"
  | "order"
  | "conversion";

export interface AffiliateOrderEvent {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  device_type: string | null;
  country: string | null;
  id_1: string | null;
  checkout_code: string | null;
}

export interface AffiliateClickEvent {
  id: string;
  time: string;
  utm_source: string | null;
  referrer: string | null;
  landing_page: string | null;
  device: string | null;
  country: string | null;
  city: string | null;
  ip: string | null;
}

export interface AffiliatePageViewEvent {
  url: string;
  time_spent: number;
  time: string;
  device: string | null;
  country: string | null;
}

export interface AffiliateSessionEvent {
  id: string;
  device_type: string | null;
  country: string | null;
  city: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface AffiliateConversionEvent {
  id: string;
  commission_amount: number;
  commission_rate: number;
  revenue_amount: number;
  created_at: string;
  landing_page: string | null;
}

export type AffiliateEventResponseByType = {
  click: AffiliateClickEvent[];
  page_view: AffiliatePageViewEvent[];
  session: AffiliateSessionEvent[];
  order: AffiliateOrderEvent[];
  conversion: AffiliateConversionEvent[];
};

export type GetAffiliateEventsResponse =
  AffiliateEventResponseByType[AffiliateEventType];

export interface AffiliateFunnelSteps {
  clicks: number;
  sessions: number;
  page_views: number;
  orders: number;
  conversions: number;
  revenue: number;
}

export interface AffiliateFunnelConversionRates {
  click_to_session: number;
  session_to_view: number;
  view_to_order: number;
  order_to_conversion: number;
}

export interface AffiliateFunnelResponse {
  steps: AffiliateFunnelSteps;
  conversion_rates: AffiliateFunnelConversionRates;
}

export async function getAffiliates() {
  const { data } = await apiAdmin.get("/affiliate/all", {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return data as AffiliateResponse[];
}

export async function getAffiliateOwners() {
  const { data } = await apiAdmin.get("/affiliate/get_all_affiliate_owner", {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return data as AffiliateOwnerResponse[];
}

export async function getAffiliatesByOwner(ownerId: string) {
  const { data } = await apiAdmin.get(`/affiliate/get_by_owner/${ownerId}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return data as AffiliateResponse[];
}

export async function getAffiliateById(id: string) {
  const { data } = await apiAdmin.get(`/affiliate/get/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return data as AffiliateResponse;
}

export async function getAffiliateEvents<
  TType extends AffiliateEventType = AffiliateEventType,
>(
  affiliate_id: string,
  params?: Omit<GetAffiliateEventsParams, "type"> & { type?: TType },
) {
  const { data } = await apiAdmin.get(
    `/affiliate/affiliate/${affiliate_id}/analytics/events`,
    {
      params: {
        ...(params?.device !== undefined && { device: params.device }),
        ...(params?.country !== undefined && { country: params.country }),
        ...(params?.status !== undefined && { status: params.status }),
        ...(params?.from_date !== undefined && { from_date: params.from_date }),
        ...(params?.to_date !== undefined && { to_date: params.to_date }),
        ...(params?.type !== undefined && { type: params.type }),
        ...(params?.page !== undefined && { page: params.page }),
        ...(params?.page_size !== undefined && { page_size: params.page_size }),
      },
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return data as AffiliateEventResponseByType[TType];
}

export async function getAffiliateFunnel(params: GetAffiliateFunnelParams) {
  const { data } = await apiAdmin.get("/affiliate/analytics/funnel", {
    params: {
      affiliate_id: params.affiliate_id,
      ...(params.from_date !== undefined && { from_date: params.from_date }),
      ...(params.to_date !== undefined && { to_date: params.to_date }),
    },
    headers: {
      "Content-Type": "application/json",
    },
  });

  return data as AffiliateFunnelResponse;
}

export async function createAffiliate(input: AffiliateCreateInput) {
  const { data } = await apiAdmin.post("/affiliate/create", input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data as AffiliateResponse;
}

export async function updateAffiliate(id: string, input: AffiliateUpdateInput) {
  const { data } = await apiAdmin.put(`/affiliate/put/${id}`, input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data as AffiliateResponse;
}

export async function deleteAffiliate(id: string) {
  const { data } = await apiAdmin.delete(`/affiliate/delete/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data;
}

export async function generateAffiliateLink(input: GenerateAffiliateLinkInput) {
  const { affiliate_id, expire_in } = input;

  const { data } = await apiAdmin.post(
    `/affiliate/generate-link/${affiliate_id}`,
    null,
    {
      params: {
        ...(expire_in !== undefined && { expire_in }),
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
    },
  );

  return data as string;
}

export async function trackAffiliateClick(input: TrackAffiliateClickInput) {
  const { data } = await apiPublic.post("/affiliate/track-click", input, {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  return data as TrackAffiliateClickResponse;
}

export async function trackAffiliatePageView(
  input: TrackAffiliatePageViewInput,
) {
  const { data } = await apiPublic.post("/affiliate/track-page-view", input, {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  return data as TrackAffiliatePageViewResponse;
}

export async function trackAffiliateOrder(input: TrackAffiliateOrderInput) {
  const { data } = await apiPublic.post("/affiliate/track-order", input, {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  return data as TrackAffiliateOrderResponse;
}

export async function checkoutCompleted(main_checkout_id: string) {
  const { data } = await apiPublic.post(
    `/affiliate/checkout-completed/${main_checkout_id}`,
    null,
    {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    },
  );

  return data as CheckoutCompletedResponse;
}
