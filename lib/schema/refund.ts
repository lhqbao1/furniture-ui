import { z } from "zod";

export const refundProductFileSchema = z.object({
  url: z.string().min(1, "File URL is required"),
});

export const refundProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "Product SKU is required"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .nonnegative("Quantity must be greater than or equal to 0"),
  id_provider: z.string().min(1, "Product id_provider is required"),
  unit_price: z.number().nonnegative("Unit price must be greater than or equal to 0"),
  refund_amount: z
    .number()
    .nonnegative("Refund amount must be greater than or equal to 0"),
  reason: z.string().min(1, "Reason is required"),
  type: z.string().min(1, "Type is required"),
  file: z.array(refundProductFileSchema),
});

export const createRefundMainCheckoutSchema = z.object({
  amount: z.number().nonnegative("Amount must be greater than or equal to 0"),
  products: z.array(refundProductSchema),
});

export type RefundProductFile = z.infer<typeof refundProductFileSchema>;
export type RefundProductInput = z.infer<typeof refundProductSchema>;
export type CreateRefundMainCheckoutPayload = z.infer<
  typeof createRefundMainCheckoutSchema
>;

