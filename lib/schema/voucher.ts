import { z } from "zod";

export const voucherSchema = z.object({
  code: z.string().min(1, "code is required"),
  name: z.string().min(1, "name is required"),
  type: z.string().min(1, "type is required"),
  discount_type: z.string().min(1, "discount_type is required"),

  discount_value: z.number().min(0, "discount_value is required"),
  max_discount: z.number().min(0, "max_discount is required"),
  min_order_value: z.number().min(0, "min_order_value is required"),

  start_at: z.string().min(1, "start_at is required"),
  end_at: z.string().min(1, "end_at is required"),

  total_usage_limit: z.number().min(0, "total_usage_limit is required"),
  user_usage_limit: z.number().min(0, "user_usage_limit is required"),

  is_active: z.boolean(),
});

export type VoucherFormValues = z.infer<typeof voucherSchema>;

export const voucherDefaultValues: VoucherFormValues = {
  code: "",
  name: "",
  type: "",
  discount_type: "",
  discount_value: 0,
  max_discount: 0,
  min_order_value: 0,
  start_at: "",
  end_at: "",
  total_usage_limit: 0,
  user_usage_limit: 0,
  is_active: false,
};

export const voucherUpdateSchema = z.object({
  name: z.string().min(1, "name is required"),
  discount_value: z.number().min(0, "discount_value is required"),
  max_discount: z.number().min(0, "max_discount is required"),
  min_order_value: z.number().min(0, "min_order_value is required"),
  start_at: z.string().min(1, "start_at is required"),
  end_at: z.string().min(1, "end_at is required"),
  is_active: z.boolean(),
});

export type VoucherUpdateValues = z.infer<typeof voucherUpdateSchema>;

export const voucherUpdateDefaultValues: VoucherUpdateValues = {
  name: "",
  discount_value: 0,
  max_discount: 0,
  min_order_value: 0,
  start_at: "",
  end_at: "",
  is_active: false,
};

export const assignVoucherToProductSchema = z.object({
  voucher_id: z.string().min(1),
});
