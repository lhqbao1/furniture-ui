import { z } from "zod"

export const cartFormSchema = z.object({
  productId: z.string().min(1),
  // option_id: z.array(z.string().min(1)).min(1, "Phải chọn ít nhất 1 option"),
  option_id: z.array(z.string()),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  is_active: z.boolean().optional(),
})

export type CartFormValues = z.infer<typeof cartFormSchema>
