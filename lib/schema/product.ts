import z from "zod";
import { StaticFile } from "@/types/products";

// schema cho StaticFile
const StaticFileSchema = z.object({
  url: z.string(),
})

export const addProductSchema = z.object({
  name: z.string().min(2, { message: "Product name is required" }),
  description: z.string().optional(),
  price: z.number("You must provide product price").min(1, "You must provide product price").nonnegative(),
  id_provider: z.string().min(1, 'You must provide an ID for product'),
  cost: z.number("You must provide product cost price").min(1, "You must provide product cost price").nonnegative(),
  discount_percent: z.number().nonnegative().optional(),
  discount_amount: z.number().nonnegative().optional(),
  final_price: z.number().nonnegative(),
  tax: z.string().min(1, { message: "Tax is required" }),
  collection: z.string().optional().nullable(),
  stock: z.number().min(0).nonnegative(),
  sku: z.string().min(1, "You must provide product sku"),
  ean: z.string().min(1, "You must provide product EAN"),
  weight: z.number().min(1, "You must provide product weight").nonnegative(),
  length: z.number().min(1, "You must provide product length").nonnegative(),
  width: z.number().min(1, "You must provide product width").nonnegative(),
  height: z.number().min(1, "You must provide product height").nonnegative(),
  is_active: z.boolean(),
  tag: z.string().optional(),
  static_files: z.array(StaticFileSchema),
  category_ids: z.array(z.string()).min(1, { message: "Please select at least one category" })
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
  is_active: true,
  tag: "",
  static_files: [] as StaticFile[],
  category_ids: [] as string[],
}
  