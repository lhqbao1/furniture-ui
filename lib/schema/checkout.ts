import { z } from "zod"

export const CreateOrderSchema = z.object({
  shipping_address_id: z.string().min(1, "You need to choose a shipping address"),
  invoice_address_id: z.string().min(1, "You need to create a invoice address"),
  cart_id: z.string().min(1, "Invalid cart_id"),
  payment_method: z.string().min(1, "You need to choose payment method"),

  note: z.string().optional().nullable(),
  coupon_amount: z.number().optional().nullable(),
  voucher_amount: z.number().optional().nullable(),
  total_shipping: z.number().optional().nullable(),
  terms: z.boolean().refine(val => val === true, {message: "You must accept the Terms & Conditions",})
})

export type CreateOrderFormValues = z.infer<typeof CreateOrderSchema>
