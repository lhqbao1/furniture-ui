"use client";

import DynamicTMTracker from "@/components/shared/tracking/dynamic-tm-tracker";
type DetailTrackingPayload = {
  type: "detailpage";
  country: string;
  productid: string;
  productname: string;
  productbrand: string;
  description: string;
  amount: string;
  currency: string;
  item_url: string;
  img_url: string;
  category: string;
};

interface ProductDetailTrackingClientProps {
  eventId: string;
  payload: DetailTrackingPayload;
}

export default function ProductDetailTrackingClient({
  eventId,
  payload,
}: ProductDetailTrackingClientProps) {
  return <DynamicTMTracker eventId={eventId} payload={payload} />;
}
