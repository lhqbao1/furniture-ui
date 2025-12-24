import { CARRIERS } from "@/data/data";

export function getCarrierLogo(carrier?: string) {
  if (!carrier) return null;

  const key = carrier.toLowerCase();

  return CARRIERS.find((c) => c.id === key)?.logo ?? null;
}
