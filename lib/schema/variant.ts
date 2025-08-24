// variantSchema.ts
import { z } from "zod"

export const OptionSchema = z.object({
  label: z.string(),
  image_url: z.string().optional().nullable(),
  extra_price: z.number(),
  id: z.string().optional(),
})

export const VariantSchema = z.object({
  name: z.string().min(1, 'Must provide variant name'),
  is_active: z.boolean(),
  type: z.string().min(1, 'Must provide variant type'),
  id: z.string().optional(),
  options: z.array(OptionSchema).min(1, { message: "You must add at least one option" }),
  optionType: z.string().min(1, "Must provide variant option's type")
})

// ✅ Lấy TypeScript type
export type Option = z.infer<typeof OptionSchema>
export type Variant = z.infer<typeof VariantSchema>
