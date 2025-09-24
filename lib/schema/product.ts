import z from "zod";
import { StaticFile } from "@/types/products";

// schema cho StaticFile
const StaticFileSchema = z.object({
  url: z.string(),
})

export const addProductSchema = z.object({
  name: z.string().min(2, { message: "Product name is required" }),
  description: z.string().optional(),
  price: z.number().nonnegative().optional(),
  cost: z.number("You must provide product cost price").min(1, "You must provide product cost price").nonnegative(),
  delivery_cost: z.number().optional().nullable(),
  discount_percent: z.number().nonnegative().optional(),
  discount_amount: z.number().nonnegative().optional(),
  final_price: z.number().nonnegative().optional(),
  tax: z.string().min(1, { message: "Tax is required" }),
  collection: z.string().optional().nullable(),
  stock: z.number().min(0).nonnegative(),
  // sku: z.string().min(1, "You must provide product sku"),
  sku: z.string().optional().nullable(),
  ean: z.string().optional().nullable(),
  carrier: z.string().optional().nullable(),
  delivery_time:z.string().optional().nullable(),
  manufacture_country: z.string().optional().nullable(),
  tariff_number: z.string().optional().nullable(),
  brand_id: z.string().optional().nullable(),
  // weight: z.number().min(1, "You must provide product weight").nonnegative(),
  weight: z.number().optional().nullable(),
  length: z.number().optional().nullable(),
  width: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
  // length: z.number().min(1, "You must provide product length").nonnegative(),
  // width: z.number().min(1, "You must provide product width").nonnegative(),
  // height: z.number().min(1, "You must provide product height").nonnegative(),
  is_active: z.boolean(),
  tag: z.string().optional().nullable(),
  static_files: z.array(StaticFileSchema),
  category_ids: z.array(z.string()),

  weee_nr: z.string().optional().nullable(),
  eek: z.string().optional().nullable(),
  gpsr_info: z.string().optional().nullable(),

  url_key: z.string().optional().nullable(),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
  // category_ids: z.array(z.string()).min(1, { message: "Please select at least one category" })
})


export type ProductInput = z.infer<typeof addProductSchema>

export const defaultValues = {
  name: "",
  description: "",
  id_provider: "test",
  tax: "19%",
  category: "",
  weight: 0,
  delivery_cost: 0,
  collection: null as string | null,
  ean: "",
  is_active: false,
  static_files: [] as StaticFile[],
  category_ids: [] as string[],
  weee_nr: "",
  eek: "",
  gpsr_info: "",
  delivery_time: "3-5"
  // brand_id: "",
  // carrier: "",
  // delivery_time: "",
  // manufacture_country: "",
  // tariff_number: ""
}
  