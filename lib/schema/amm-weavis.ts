import { z } from "zod";

export const weAvisKopfdatenSchema = z.object({
  client: z.string().min(1, "Client is required"),
  order_number: z
    .string()
    .regex(
      /^[A-Za-z0-9]+$/,
      "Order number must contain only letters and numbers",
    ),
  supplier_id: z.string().min(1, "Supplier ID is required"),
  supplier_name: z.string().min(1, "Supplier name is required"),
  supplier_city: z.string().min(1, "Supplier city is required"),
  supplier_postal_code: z
    .string()
    .min(1, "Supplier postal code is required")
    .max(8, "Postal code must be at most 8 characters"),
  supplier_country: z.string().min(1, "Supplier country is required"),
  delivery_date: z.string().min(1, "Delivery date is required"), // YYYYMMDD
  warehouse: z.string().min(1, "Warehouse is required"),
  cancel: z.string().optional(), // backend optional
});

export const weAvisItemSchema = z.object({
  position_number: z.number().int().min(1),
  reference: z.string().min(1, "Reference is required"),
  title: z.string().min(1, "Title is required"),
  unit: z.string().min(1, "Unit is required"),
  quantity: z.number().min(1, "Quantity must be greater than 0"),
  product_id: z.string().optional().nullable(),
});

export const ammWeAvisSchema = z.object({
  kopfdaten: weAvisKopfdatenSchema,
  items: z.array(weAvisItemSchema).min(1, "At least one item is required"),
});

export type WeAvisKopfdaten = z.infer<typeof weAvisKopfdatenSchema>;
export type WeAvisItem = z.infer<typeof weAvisItemSchema>;
export type ImportWeAvisPayload = z.infer<typeof ammWeAvisSchema>;

export const weAvisDefaultValues: ImportWeAvisPayload = {
  kopfdaten: {
    client: "243",
    order_number: "",
    supplier_id: "29",
    supplier_name: "NORMA24 Online-Shop GmbH & Co. KG",
    supplier_city: "Röttenbach",
    supplier_postal_code: "91341",
    supplier_country: "DE",
    delivery_date: "", // YYYYMMDD
    warehouse: "9_1 Amm GmbH",
    cancel: "0",
  },
  items: [],
};
