import { z } from "zod";

export const incomingInventorySchema = z.object({
  po_number: z.string().min(1, "PO number is required"),
  pi_number: z.string().min(1, "PI number is required"),

  created_by: z.string().min(1, "Created by is required"),

  loading_port: z.string().min(1, "Loading port is required"),
  shipping_method: z.string().min(1, "Shipping method is required"),

  buyer_id: z.string().uuid("You need to choose buyer"),
  seller_id: z.string().uuid("You need to choose seller"),
  // bank_id: z.string().uuid("You need to have a bank data of seller"),

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

export const containerSchema = z.object({
  size: z.string().min(1, "Container size is required"),

  date_of_inspection: z.string().optional().nullable(),

  date_if_shipment: z.string().optional().nullable(),

  date_of_issue: z.string().min(1, "Delivery date is required"),
});

export type ContainerValues = z.infer<typeof containerSchema>;

export const containerDefaultValues: ContainerValues = {
  size: "",
  date_of_issue: "",
};

export const containerInventorySchema = z.object({
  product_id: z.string().min(1, "You must select a product"),

  quantity: z.number().min(1, "Quantity is required"),

  unit_cost: z.number().min(1, "Unit cost is required"),

  total_cost: z.number().min(1, "Total cost is required"),

  description: z.string().min(1, "Description is required"),
});

export type ContainerInventoryValues = z.infer<typeof containerInventorySchema>;

export const containerInventoryDefaultValues: ContainerInventoryValues = {
  product_id: "",
  quantity: 0,
  unit_cost: 0,
  total_cost: 0,
  description: "",
};
