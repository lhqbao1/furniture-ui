import { optional, z } from "zod";

export const ManualOrderItemSchema = z.object({
  id_provider: z.string().min(1, { message: "Product ID is required" }),
  quantity: z
    .number()
    .int({ message: "Quantity must be an integer" })
    .nonnegative({ message: "Quantity must be positive" }),
  title: z.string().optional(),
  sku: z.string().optional(),
  final_price: z
    .number()
    .nonnegative({ message: "Final price must be positive" }),
  carrier: z.string(),
});

export type ManualOrderItem = z.infer<typeof ManualOrderItemSchema>;

export const ManualCreateOrderSchema = z
  .object({
    email: z.string().optional().nullable(),
    tax_id: z.string().optional().nullable(),
    first_name: z.string().optional().nullable(),
    last_name: z.string().optional().nullable(),
    phone_number: z.string().optional().nullable(),
    company_name: z.string().optional().nullable(),

    address: z.string().min(1, { message: "Address is required" }),
    city: z.string().min(1, { message: "City is required" }),
    postal_code: z.string().min(1, { message: "Postal code is required" }),
    additional_address: z.string().optional().nullable(),
    country: z.string().min(1, { message: "Country is required" }),
    recipient_name: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email_shipping: z.string().optional().nullable(),

    invoice_address: z.string().min(1, { message: "Address is required" }),
    invoice_city: z.string().min(1, { message: "City is required" }),
    invoice_postal_code: z
      .string()
      .min(1, { message: "Postal code is required" }),
    invoice_additional_address: z.string().optional().nullable(),
    invoice_country: z.string().min(1, { message: "Country is required" }),
    invoice_recipient_name: z.string().optional().nullable(),
    invoice_phone: z.string().optional().nullable(),
    email_invoice: z.string().optional().nullable(),

    from_marketplace: z.string().optional().nullable(),
    marketplace_order_id: z.string().optional().nullable(),

    total_amount: z.number().optional(),
    total_amount_item: z.number().optional(),
    total_shipping: z.number().optional(),
    total_discount: z.number().optional(),
    carrier: z.string().optional(),
    tax: z.number().min(0, "Tax is required"),
    payment_term: z.number().optional().nullable(),

    status: z.string().min(1, "Status is required"),

    items: z.array(ManualOrderItemSchema).min(1, {
      message: "You must select at least one product",
    }),
  })
  .superRefine((data, ctx) => {
    if (
      data.status === "PENDING" &&
      (data.payment_term === null || data.payment_term === undefined)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Payment term is required when status is Waiting for Payment",
        path: ["payment_term"],
      });
    }
  });

export type ManualCreateOrderFormValues = z.infer<
  typeof ManualCreateOrderSchema
>;

export const manualCheckoutDefaultValues: ManualCreateOrderFormValues = {
  email: "",
  first_name: "",
  last_name: "",
  address: "",
  status: "PAID",
  city: "",
  postal_code: "",
  country: "DE",
  invoice_country: "DE",
  invoice_address: "",
  invoice_city: "",
  invoice_postal_code: "",
  from_marketplace: "amazon",
  total_shipping: 0,
  carrier: "",
  items: [],
  recipient_name: "",
  invoice_recipient_name: "",
  phone: "",
  invoice_phone: "",
  tax: 19,
};
