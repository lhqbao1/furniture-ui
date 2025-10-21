import { StaticFile } from "@/types/products"
import { z } from "zod"


export const createQASchema = z.object({
  rating: z.number().optional().nullable(),
  static_files: z.array(z.string()).optional(),
  comment: z.string().min(1, "Comment is required"),
  product_id: z.string().min(1, "Product is required"),
  parent_id: z.string().optional().nullable(),
  user_id: z.string().optional().nullable()
})

export const qaDefaultValues =  {
  static_files: [] as StaticFile[],
  comment: "",
  product_id: "",
}

export type QAFormValues = z.infer<typeof createQASchema>
