// variantSchema.ts
import { z } from "zod"

export const OptionSchema = z.object({
  label: z.string(),
  image_url: z.string().optional(),
  extra_price: z.number(),
  stock: z.number().min(0),
  id: z.string().optional(),
})

export const VariantSchema = z.object({
  name: z.string().min(1, 'Must provide variant name'),
  is_active: z.boolean(),
  is_global: z.boolean(),
  id: z.string().optional(),
  options: z.array(OptionSchema).min(1, { message: "You must add at least one option" }),
  optionType: z.string().optional()
})

// ✅ Lấy TypeScript type
export type Option = z.infer<typeof OptionSchema>
