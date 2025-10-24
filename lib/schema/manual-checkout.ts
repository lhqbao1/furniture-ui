import { z } from "zod"

export const ManualCreateOrderSchema = z.object({
  email: z
    .string()
    .optional().nullable(),

  first_name: z.string().min(1, { message: "First name is required" }),
  last_name: z.string().min(1, { message: "Last name is required" }),
  phone_number: z.string().optional().nullable(),

  address: z.string().min(1, { message: "Address is required" }),
  city: z.string().min(1, { message: "City is required" }),
  postal_code: z.string().min(1, { message: "Postal code is required" }),

  invoice_address: z.string().optional(),
  invoice_city: z.string().optional(),
  invoice_postal_code: z.string().optional(),

  from_marketplace: z.string().optional(),
  marketplace_order_id: z.string().optional().nullable(),

  total_amount: z.number().optional(),
  total_amount_item: z.number().optional(),
  total_shipping: z.number().optional(),
  total_discount: z.number().optional(),
  carrier: z.string().optional(),

  items: z.array(
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
    })
  ).min(1, {message: "You must select at least one product"}),
})

export type ManualCreateOrderFormValues = z.infer<typeof ManualCreateOrderSchema>

export const manualCheckoutDefaultValues: ManualCreateOrderFormValues = {
  email: "",
  first_name: "",
  last_name: "",
  address: "",
  city: "",
  postal_code: "",
  invoice_address: "",
  invoice_city: "",
  invoice_postal_code: "",
  from_marketplace: "",
  total_amount: 0,
  total_amount_item: 0,
  total_shipping: 0,
  total_discount: 0,
  carrier: "",
  items: [],
}
