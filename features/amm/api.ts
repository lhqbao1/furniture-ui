import { apiPublic } from "@/lib/axios";
import { ImportWeAvisPayload } from "@/lib/schema/amm-weavis";

export async function importWeAvis(payload: ImportWeAvisPayload) {
  const { data } = await apiPublic.post("/amm/import-weavis", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return data;
}
