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

export const inventoryCreateDefaultValues: InventoryCreateValues = {
  product_id: "",
  incoming_stock: 0, // số lượng nhập
  date_received: "", // string date (ISO hoặc yyyy-mm-dd)
  cost_received: 0, // giá nhập
  total_cost: 0, // tổng giá
};
