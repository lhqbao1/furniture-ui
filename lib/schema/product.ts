import z from "zod";
import {  VariantSchema } from "./variant";
import { fa } from "zod/v4/locales";
import { StaticFile, Variant } from "@/types/products";

// schema cho StaticFile
const StaticFileSchema = z.object({
  url: z.string(),
  file_type: z.string().optional(),
  id: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export const addProductSchema = z.object({
  name: z.string().min(2, { message: "Product name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  price: z.number().min(0),
  discount_percent: z.number().min(0).max(100).optional(),
  discount_amount: z.number().optional(),
  final_price: z.number(),
  tax: z.string().min(1, { message: "Tax is required" }),
  category: z.string().optional(),
  collection: z.string().optional().nullable(),
  stock: z.number().min(0),
  sku: z.string(),
  barcode: z.string(),
  weight: z.number(),
  length: z.number(),
  width: z.number(),
  height: z.number(),
  is_active: z.boolean(),
  tag: z.string().optional(),
  static_files: z.array(StaticFileSchema),
  variants: z.array(VariantSchema),

  // giữ lại các field phụ nhưng optional (không có trong ProductItem)
  materials: z.string().optional(),
  color: z.string().optional(),
  size: z
    .object({
      sizeLength: z.string().optional(),
      sizeWidth: z.string().optional(),
      sizeHeight: z.string().optional(),
    })
    .optional(),
})


export type Products = z.infer<typeof addProductSchema>

export const defaultValues = {
    name: "",
    description: "",
    price: 0,
    discount_percent: 0,
    discount_amount: 0,
    final_price: 0,
    tax: "19%",
    category: "",
    collection: "None",
  
    stock: 0,
    sku: "",
    barcode: "",
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
  
    is_active: false,
    tag: "",
  
    static_files: [] as StaticFile[],
  
    variants: [] as Variant[],
  
    // những field phụ UI, optional
    materials: "",
    color: "",
    size: {
      sizeLength: "",
      sizeWidth: "",
      sizeHeight: "",
    },
  }
  