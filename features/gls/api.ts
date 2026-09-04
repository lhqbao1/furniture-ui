import { apiPublic } from "@/lib/axios";

export interface GlsOutboundShippingAddress {
  recipient_company: string;
  recipient_first_name: string;
  recipient_last_name: string;
  recipient_email: string;
  recipient_phone: string;
  recipient_street: string;
  recipient_house_no: string;
  recipient_zip: string;
  recipient_city: string;
  recipient_country: string;
}

export interface GlsOutboundParcelData {
  weight: number;
  content: string;
  outbound_id: string;
  outbound_rf_1: string;
  outbound_rf_2: string;
}

export interface GlsOutboundOrderDataItem {
  shipping_address: GlsOutboundShippingAddress;
  parcel_data: GlsOutboundParcelData;
}

export interface CreateGlsOutboundLabelsPayload {
  orderdata: GlsOutboundOrderDataItem[];
}

export async function createGlsOutboundLabels(
  payload: CreateGlsOutboundLabelsPayload,
) {
  const response = await apiPublic.post("/gls/outbound-labels", payload, {
    headers: {
      "Content-Type": "application/json",
    },
    responseType: "blob",
  });

  const contentType = String(response.headers["content-type"] ?? "");
  const data = response.data as Blob;

  if (contentType.includes("application/json")) {
    const text = await data.text();

    return text ? JSON.parse(text) : null;
  }

  return data;
}
