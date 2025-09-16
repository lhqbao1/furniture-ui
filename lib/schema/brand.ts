import { StaticFile } from "@/types/products"
import { z } from "zod"
const StaticFileSchema = z.object({
  url: z.string(),
})

export const brandFormSchema = z.object({
  name: z.string().min(1, "You need provide brand name"),
  static_files: z.array(StaticFileSchema).optional(),
  company_name: z.string().min(1, "Company name is required"),
  company_address: z.string().min(1, "Company address is required"),
  company_email: z.string().email().min(1, "Company email is required")
})

export const brandDefaultValues =  {
  name: "",
  static_files: [] as StaticFile[],
  company_name: "",
  company_address: "",
  company_email: ""
}

export type BrandFormValues = z.infer<typeof brandFormSchema>
