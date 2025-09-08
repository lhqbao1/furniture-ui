import z from "zod";
import { StaticFile } from "@/types/products";

// schema cho StaticFile
const StaticFileSchema = z.object({
  url: z.string(),
})

export const addProductSchema = z.object({
  name: z.string().min(2, { message: "Product name is required" }),
  // description: z.string().min(1, { message: "Description is required" }),
  description: z.string().optional().nullable(),
  price: z.number().min(1, "You must provide a price"),
  id_provider: z.string().min(1, 'You must provide an ID for product'),
  cost: z.number().min(1, "You must provide a cost price"),
  discount_percent: z.number().optional(),
  discount_amount: z.number().optional(),
  final_price: z.number(),
  tax: z.string().min(1, { message: "Tax is required" }),
  category: z.string().optional(),
  collection: z.string().optional().nullable(),
  stock: z.number().min(0),
  sku: z.string(),
  ean: z.string(),
  weight: z.number(),
  length: z.number(),
  width: z.number(),
  height: z.number(),
  is_active: z.boolean(),
  tag: z.string().optional(),
  static_files: z.array(StaticFileSchema),
  category_ids: z.array(z.string().min(1))
})


export type ProductInput = z.infer<typeof addProductSchema>

export const defaultValues = {
  name: "",
  description: "",
  id_provider: '',
  tax: "19%",
  category: "",
  collection: null as string | null,
  sku: "",
  ean: "",
  is_active: false,
  tag: "",
  static_files: [] as StaticFile[],
  category_ids: [] as string[],
}
  