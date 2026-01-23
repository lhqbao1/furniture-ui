import { z } from "zod";

export const incomingInventorySchema = z.object({
  po_number: z.string().min(1, "PO Number is required"),
  pi_number: z.string().min(1, "PO Number is required"),
  author: z.string().min(1, "Author is required"),
  status: z.string().min(1, "Status is required"),

  warehouse_id: z.string().min(1, "Warehouse"),
  warehouse_address: z.string().min(1, "Warehouse address is required"),
  date_of_inspection: z.string().min(1, "Date of inspection is required"),
  date_of_shipment: z.string().min(1, "Date of shipment is required"),
  delivery_date: z.string().min(1, "Delivery date is required"),
  port: z.string().min(1, "Port is required"),
  shipping_method: z.string().min(1, "Shipping method is required"),
  number_of_containers: z.number().min(1, "Number of containers is required"),
  incoterms: z.string().optional().nullable(),
});

export const incomingInventoryUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  tax_id: z.string().optional().nullable(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  postal_code: z.string().min(1, "Postal Code is required"),
  fax: z.string().min(1, "Fax is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  email: z.string().min(1, "Email is required"),
  web: z.string().min(1, "Web is required"),
});

export const incomingInventoryContactPersonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  email: z.string().min(1, "Email is required"),
});

export type IncomingInventoryValues = z.infer<typeof incomingInventorySchema>;
export type IncomingInventoryUserValues = z.infer<
  typeof incomingInventoryUserSchema
>;
