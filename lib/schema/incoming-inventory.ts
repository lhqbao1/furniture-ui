import { z } from "zod";

export const incomingInventorySchema = z.object({
  po_number: z.string().min(1, "PO number is required"),
  pi_number: z.string().min(1, "PI number is required"),

  created_by: z.string().min(1, "Created by is required"),

  loading_port: z.string().min(1, "Loading port is required"),
  shipping_method: z.string().min(1, "Shipping method is required"),

  number_of_containers: z
    .number()
    .int("Number of containers must be an integer")
    .min(0, "Number of containers must be 0 or greater"),

  buyer_id: z.string().uuid("Invalid buyer ID"),
  seller_id: z.string().uuid("Invalid seller ID"),
  warehouse_id: z.string().uuid("Invalid warehouse ID"),

  customer_po_order: z.string().optional().nullable(),

  payment_terms: z.string().min(1, "Payment terms is required"),
  delivery_conditions: z.string().min(1, "Delivery conditions is required"),

  type_of_bill_of_lading: z
    .string()
    .min(1, "Type of bill of lading is required"),

  destination: z.string().min(1, "Destination is required"),

  note: z.string().optional(), // thường note cho phép rỗng
});

export type IncomingInventoryValues = z.infer<typeof incomingInventorySchema>;
