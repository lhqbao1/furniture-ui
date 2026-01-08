import z from "zod";

export const VariableFeeCreateSchema = z.object({
  marketplace: z.string().min(1),
  type: z.string().min(1), // transaction | ads | additional | custom
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().optional(),
  quarter: z.number().int().optional(),
  amount: z.number().nonnegative(),
});

export type VariableFeeCreateValues = z.infer<typeof VariableFeeCreateSchema>;
