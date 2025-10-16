import z from "zod";
import { StaticFile } from "@/types/products";

// schema cho StaticFile
const StaticFileSchema = z.object({
  url: z.string(),
})

export const packageSchema = z.object({
  weight: z.number().nonnegative().optional().nullable(),
  length: z.number().nonnegative().optional().nullable(),
  width: z.number().nonnegative().optional().nullable(),
  height: z.number().nonnegative().optional().nullable(),
})

export const marketPlaceSchema = z.object({
  marketplace: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  final_price: z.number().nonnegative().optional().nullable(),
  min_stock: z.number().nonnegative().optional().nullable(),
  max_stock: z.number().nonnegative().optional().nullable(),
  current_stock: z.number().nonnegative().optional().nullable(),
  line_item_id: z.string().optional().nullable(),
  marketplace_offer_id: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  is_active: z.boolean().optional().nullable(),
  sku: z.string().optional().nullable(),
}).refine(
  (data) => {
    if (data.marketplace) {
      return (
        data.name &&
        data.description &&
        data.final_price !== null &&
        data.final_price !== undefined &&
        data.min_stock !== null &&
        data.min_stock !== undefined &&
        data.max_stock !== null &&
        data.max_stock !== undefined
      );
    }
    return true;
  },
  {
    message: "If marketplace is provided, all other fields must also be filled in.",
    path: ["marketplace"],
  }
);


export const addProductSchema = z.object({
  name: z.string().min(1, { message: "Product name is required" }).max(80, "Product name must be less than 80 characters"),
  description: z.string().optional().nullable(),
  price: z.number().nonnegative().optional().nullable(),
  cost: z.number().optional().nullable(),
  delivery_cost: z.number().optional().nullable(),
  discount_percent: z.number().nonnegative().optional(),
  discount_amount: z.number().nonnegative().optional(),
  final_price: z.number().optional().nullable(),
  tax: z.string().min(1, { message: "Tax is required" }),
  collection: z.string().optional().nullable(),
  stock: z.number().nonnegative().optional().nullable(),
  delivery_multiple: z.boolean().optional().nullable(),
  
  materials: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
  amount_unit: z.string().optional().nullable(),
  incoterm: z.string().optional().nullable(),
  sku: z.string().min(1, "Product SKU is required"),
  number_of_packages: z.number().optional().nullable(),
  ean: z.string().optional().nullable(),
  carrier: z.string().optional().nullable(),
  delivery_time:z.string().optional().nullable(),
  manufacture_country: z.string().optional().nullable(),
  tariff_number: z.string().optional().nullable(),
  brand_id: z.string().optional().nullable(),
  ebay: z.boolean().optional().nullable(),
  // weight: z.number().min(1, "You must provide product weight").nonnegative(),
  weight: z.number().optional().nullable(),
  length: z.number().optional().nullable(),
  width: z.number().optional().nullable(),
  height: z.number().optional().nullable(),

  is_active: z.boolean(),
  tag: z.string().optional().nullable(),
  static_files: z.array(StaticFileSchema),
  category_ids: z.array(z.string()).optional().nullable(),

  weee_nr: z.string().optional().nullable(),
  eek: z.string().optional().nullable(),
  gpsr_info: z.string().optional().nullable(),

  url_key: z.string().optional().nullable(),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
  meta_keywords: z.string().optional().nullable(),

  pallet_unit: z.number().optional().nullable(),
  packages: z.array(packageSchema).optional(),
  marketplace_products: z.array(marketPlaceSchema).optional(),
})


export type ProductInput = z.infer<typeof addProductSchema>

export const defaultValues = {
  name: "",
  description: "",
  tax: "19%",
  category: "",
  ebay: false,
  sku: "",
  // delivery_cost: 0,
  collection: null as string | null,
  // ean: "",
  is_active: false,
  static_files: [] as StaticFile[],
  category_ids: [] as string[],
  // brand_id: "",
  // carrier: "",
  // delivery_time: "",
  // manufacture_country: "",
  // tariff_number: ""
}
  