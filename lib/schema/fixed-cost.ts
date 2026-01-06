import { z } from "zod";

export const fixedCostSchema = z.object({
  type: z.string().min(1, "type is required"),

  month: z.number().int().min(1).max(12).optional(),

  year: z.number().int().min(2025).optional(),

  quarter: z.number().int().min(1).max(4).optional(),

  amount: z.number().nonnegative(),

  from_date: z.string().datetime({ offset: true }).optional(),

  to_date: z.string().datetime({ offset: true }).optional(),
});

export type CreateFixedFeeValues = z.infer<typeof fixedCostSchema>;
