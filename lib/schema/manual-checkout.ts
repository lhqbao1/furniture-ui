import { z } from "zod";

export const ManualCreateOrderSchema = z.object({
  email: z.string().optional().nullable(),
  tax_id: z.string().optional().nullable(),
  first_name: z.string().min(1, { message: "First name is required" }),
  last_name: z.string().min(1, { message: "Last name is required" }),
  phone_number: z.string().optional().nullable(),

  address: z.string().min(1, { message: "Address is required" }),
  city: z.string().min(1, { message: "City is required" }),
  postal_code: z.string().min(1, { message: "Postal code is required" }),
  additional_address: z.string().optional(),
  country: z.string().min(1, { message: "Country is required" }),
  recipient_name: z.string().min(1, "Recipient Name is required"),
  phone: z.string().min(1, "Phone number is required"),

  invoice_address: z.string().optional(),
  invoice_city: z.string().optional(),
  invoice_postal_code: z.string().optional(),
  invoice_additional_address: z.string().optional(),
  invoice_country: z.string().optional(),
  invoice_recipient_name: z.string().min(1, "Recipient Name is required"),
  invoice_phone: z.string().min(1, "Phone number is required"),

  from_marketplace: z.string().nullable(),
  marketplace_order_id: z.string().optional().nullable(),

  total_amount: z.number().optional(),
  total_amount_item: z.number().optional(),
  total_shipping: z.number().optional(),
  total_discount: z.number().optional(),
  carrier: z.string().optional(),
  tax: z.number().min(0, "Tax is required"),
  payment_term: z.number().optional().nullable(),

  status: z.string().min(1, "Status is required"),

  items: z
    .array(
      z.object({
        product_id: z.string().min(1, { message: "Product ID is required" }),
        quantity: z
          .number()
          .int({ message: "Quantity must be an integer" })
          .nonnegative({ message: "Quantity must be positive" }),
        title: z.string().optional(),
        sku: z.string().optional(),
        final_price: z
          .number()
          .nonnegative({ message: "Final price must be positive" }),
      }),
    )
    .min(1, { message: "You must select at least one product" }),
});

export type ManualCreateOrderFormValues = z.infer<
  typeof ManualCreateOrderSchema
>;

export const manualCheckoutDefaultValues: ManualCreateOrderFormValues = {
  email: "",
  first_name: "",
  last_name: "",
  address: "",
  status: "PAID",
  city: "",
  postal_code: "",
  country: "",
  invoice_address: "",
  invoice_city: "",
  invoice_postal_code: "",
  from_marketplace: "",
  total_shipping: 0,
  carrier: "",
  items: [],
  recipient_name: "",
  invoice_recipient_name: "",
  phone: "",
  invoice_phone: "",
  tax: 19,
};
