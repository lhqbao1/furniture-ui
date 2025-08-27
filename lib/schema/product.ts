import z from "zod";
import { VariantSchema } from "./variant";

const ImageItemSchema = z.object({
    url: z.string().url() // có thể thêm validate url
  })

export const addProductSchema = z.object({
    name: z.string().min(2, { message: "Product name is required" }),
    price: z.number().min(0),
    discount_percent: z.number().min(0).max(100).optional(),
    discount_amount: z.number().optional(),
    final_price: z.number().optional(),
    description: z.string().optional(),
    static_files: z.array(ImageItemSchema),
    materials: z.string(),
    color: z.string(),
    tax: z.string(),
    size: z.object({
        sizeLength: z.string().optional(),
        sizeWidth: z.string().optional(),
        sizeHeight: z.string().optional(),
    }),
    type: z.string(),
    category: z.string().optional(),
    // collection: z.string().optional(),
    stock: z.boolean(),
    quantity: z.number().min(0),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    packaging: z.object({
        packageLength: z.string().optional(),
        packageWidth: z.string().optional(),
        packageHeight: z.string().optional(),
    }),
    weight: z.number().optional(),
    tag: z.string(),
    is_active: z.boolean(),
    variants: z.array(VariantSchema),
})

export type Products = z.infer<typeof addProductSchema>

export const defaultValues = {
    name: "",
    description: "",
    price: 0,
    discount_percent: 0,
    discount_amount: 0,
    final_price: 0,
    static_files: [],
    tax: '19%',
    materials: "",
    color: "",

    size: {
        sizeLength: "",
        sizeWidth: "",
        sizeHeight: "",
    },

    type: "",
    category: "",
    // collection: "",

    stock: false,
    is_active: false,
    quantity: 0,
    sku: "",
    barcode: "",

    packaging: {
        packageLength: "",
        packageWidth: "",
        packageHeight: "",
    },

    weight: 0,
    tag: "",
    variants: []
}