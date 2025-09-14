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
  .optional()
  .nullable()
  ,
  language: z.string().optional(),
  is_notified: z.boolean().optional(),
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
  language: "en",
  is_notified: false,
  date_of_birth: ""
}
