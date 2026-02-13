// schemas/shipment.schema.ts
import { z } from "zod";

export const shipmentSchema = z.object({
  tracking_number: z.string().min(1, "Tracking number is required"),
  shipping_carrier: z.string().min(1, "Shipping carrier is required"),
});

export type ShipmentFormValues = z.infer<typeof shipmentSchema>;
