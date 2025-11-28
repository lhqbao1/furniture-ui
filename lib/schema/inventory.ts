import { z } from "zod";

export const InventoryCreateSchema = z.object({
  product_id: z.string().min(1, { message: "Product ID is required" }),

  incoming_stock: z
    .number()
    .nonnegative({ message: "Incoming stock must be non-negative" }),

  date_received: z
    .string()
    .min(1, { message: "Date received is required" })
    .refine((v) => !isNaN(Date.parse(v)), {
      message: "Date received must be a valid date",
    }),

  cost_received: z
    .number()
    .nonnegative({ message: "Cost received must be non-negative" }),

  total_cost: z
    .number()
    .nonnegative({ message: "Total cost must be non-negative" }),
});

export type InventoryCreateValues = z.infer<typeof InventoryCreateSchema>;
