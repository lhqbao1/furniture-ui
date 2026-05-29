import { apiAdmin, apiPublic } from "@/lib/axios";
import {
  AffiliateCreateInput,
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

export async function getAffiliates() {
  const { data } = await apiPublic.get("/affiliate/all", {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return data as AffiliateResponse[];
}

export async function getAffiliateById(id: string) {
  const { data } = await apiPublic.get(`/affiliate/get/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return data as AffiliateResponse;
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
