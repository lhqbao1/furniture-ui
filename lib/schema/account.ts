import { z } from "zod"

export const accountSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string(),
  mobile: z.string().optional(),
  shipping_address: z.string().min(1),
  invoice_address: z.string().min(1),
  language: z.string(),
  dob: z.string(), // ISO date
  current_password: z.string().optional(),
  new_password: z.string().optional(),
  confirm_password: z.string().optional(),
  promotions: z.boolean(),
})

export type Account = z.infer<typeof accountSchema>
