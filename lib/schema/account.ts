import { z } from "zod"

export const accountSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  phone_number: z.string().optional(),
  first_name: z.string().min(1, "First name is required").optional(),
  last_name: z.string().min(1, "Last name is required").optional(),
  is_active: z.boolean(),
  avatar_url: z.string().optional().nullable(),
  date_of_birth: z
  .string()
  .nullable()
  .optional()
  .transform((val) => {
    if (!val) return null
    return new Date(val).toISOString()
  }),
  language: z.string().optional(),
  is_notified: z.boolean(),
  created_at: z.string().optional().nullable().transform((val) => {
    if (!val) return null
    return new Date(val).toISOString()
  }),
  updated_at: z.string().optional().nullable().transform((val) => {
    if (!val) return null
    return new Date(val).toISOString()
  }),
})

export type AccountFormValues = z.infer<typeof accountSchema>

export const accountDefaultValues: AccountFormValues = {
  id: "",
  email: "",
  phone_number: "",
  first_name: "",
  last_name: "",
  is_active: false,
  avatar_url: "",
  date_of_birth: new Date().toISOString(), // mặc định hôm nay
  language: "en",
  is_notified: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}
