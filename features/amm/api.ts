import { apiAdmin, apiPublic } from "@/lib/axios";
import { ImportWeAvisPayload } from "@/lib/schema/amm-weavis";

export interface SendXmlToAmmAfterHoldOnPayload {
  checkout_id: string;
}

export async function sendXmlToAmmAfterHoldOn(
  payload: SendXmlToAmmAfterHoldOnPayload,
) {
  const { data } = await apiAdmin.post(
    "/amm/send-xml-to-amm-after-hold-on",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return data;
}

export async function importWeAvis(payload: ImportWeAvisPayload) {
  const { data } = await apiPublic.post("/amm/import-weavis", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return data;
}

export async function importProductToAmm(id: string[]) {
  const { data } = await apiPublic.post("/amm/create-artikelstamm", id, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return data;
}
