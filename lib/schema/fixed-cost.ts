import { z } from "zod";

export const ReportSchema = z
  .object({
    type: z.string().min(1, "type is required"),

    month: z.number().int().min(1).max(12).optional(),

    year: z.number().int().min(2025).optional(),

    quarter: z.number().int().min(1).max(4).optional(),

    amount: z.number().nonnegative(),

    from_date: z.string().datetime({ offset: true }),

    to_date: z.string().datetime({ offset: true }),
  })
  .refine((data) => new Date(data.from_date) <= new Date(data.to_date), {
    message: "`from_date` must be before or equal to `to_date`",
    path: ["from_date"],
  });
