import { StaticFile } from "@/types/products"
import { z } from "zod"
const StaticFileSchema = z.object({
  url: z.string(),
})

export const brandFormSchema = z.object({
  name: z.string().min(1, "You need provide brand name"),
  static_files: z.array(StaticFileSchema)
})

export const brandDefaultValues =  {
  name: "",
  static_files: [] as StaticFile[]
}

export type BrandFormValues = z.infer<typeof brandFormSchema>
