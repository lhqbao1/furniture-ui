// lib/shipping/tracking.ts
import { CheckOut } from "@/types/checkout";

export const getTrackingUrl = (checkout: CheckOut): string | null => {
  const carrier = checkout.shipment?.shipping_carrier?.toLowerCase();
  const trackingNumber = checkout.shipment?.tracking_number;

  if (!carrier || !trackingNumber) return null;

  const carrierMap: Record<string, string> = {
    dpd: `https://tracking.dpd.de/status/de_DE/parcel/${trackingNumber}`,
    spedition: `https://tt.amm-spedition.de/tracking/anon/anondetail.seam?colliScanNumber=${trackingNumber}&j_idt166=Suche`,
  };

  return carrierMap[carrier] ?? null;
};
