import { z } from "zod"

export const ammWeAvisSchema = z.object({
  client: z.string().min(1, "Client is required"),
  order_number: z
  .string()
  .regex(/^AZ\d{6}$/, "Order number must follow format AZ000000"),
    supplier_id: z.string().min(1, "Supplier ID is required"),
  supplier_name: z.string().min(1, "Supplier name is required"),
  supplier_city: z.string().min(1, "Supplier city is required"),
  supplier_postal_code: z
    .string()
    .min(1, "Supplier postal code is required")
    .max(8, "Postal code must be at most 8 characters"),
  supplier_country: z.string().min(1, "Supplier country is required"),
  delivery_date: z.string().min(1, "Delivery date is required"),
  warehouse: z.string().min(1, "Warehouse is required"),
  file: z
    .any()
    .refine((file) => file instanceof File, "File is required")
})

export type AmmWeAvisFormValues = z.infer<typeof ammWeAvisSchema>

export const ammWeAvisDefaultValues: AmmWeAvisFormValues = {
  client: "",
  order_number: "",
  supplier_id: "",
  supplier_name: "",
  supplier_city: "",
  supplier_postal_code: "",
  supplier_country: "",
  delivery_date: "",
  warehouse: "",
  file: null
}
