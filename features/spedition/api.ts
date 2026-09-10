import { apiAdmin } from "@/lib/axios";

export interface SpeditionOutboundShippingAddress {
  recipient_company: string | null;
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

export interface SpeditionOutboundParcelData {
  weight: number;
  content: string;
  outbound_rf_1: string;
  package_type: "KT";
  length_cm: number;
  width_cm: number;
  height_cm: number;
  volume_cbm: number;
  loading_meters: 0.6;
  cart_items_id: string;
}

export interface SpeditionOutboundOrderDataItem {
  shipping_address: SpeditionOutboundShippingAddress;
  outbound_id: string;
  delivery_date: string;
  delivery_note_number: string;
}

export interface CreateSpeditionOutboundLabelPayload {
  parcel_data: SpeditionOutboundParcelData;
  orderdata: SpeditionOutboundOrderDataItem[];
}

export interface SpeditionOutboundLabelPayload {
  parcel_data: SpeditionOutboundParcelData & {
    weight: number | string;
    volume_cbm: number | string;
    loading_meters: number | string;
    dangerous_goods?: Record<string, unknown>;
  };
  orderdata: SpeditionOutboundOrderDataItem[];
}

export interface CreateSpeditionOutboundLabelResponse {
  sscc: string[];
  payload: SpeditionOutboundLabelPayload;
}

export async function createSpeditionOutboundLabel(
  payload: CreateSpeditionOutboundLabelPayload,
) {
  const { data } = await apiAdmin.post<CreateSpeditionOutboundLabelResponse>(
    "/spedition/bord512",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return data;
}
