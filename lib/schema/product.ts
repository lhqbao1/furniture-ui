import z from "zod";
import { VariantSchema } from "./variant";

export const addProductSchema = z.object({
    name: z.string().min(2, { message: "Product name is required" }),
    price: z.number().min(0),
    discountPercent: z.number().min(0).max(100).optional(),
    discountAmount: z.number().optional(),
    finalPrice: z.number().optional(),
    description: z.string().optional(),
    image: z.array(z.string()),
    materials: z.string(),
    color: z.string(),
    size: z.object({
        sizeLength: z.string().optional(),
        sizeWidth: z.string().optional(),
        sizeHeight: z.string().optional(),
    }),
    type: z.string(),
    category: z.string().optional(),
    collection: z.string().optional(),
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
    active: z.boolean(),
    variants: z.array(VariantSchema),
})

export type Products = z.infer<typeof addProductSchema>
