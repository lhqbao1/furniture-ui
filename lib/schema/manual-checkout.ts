import { z } from "zod";

const BooleanLikeSchema = z.preprocess((value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
  }
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  return value;
}, z.boolean());

export const ManualOrderItemSchema = z.object({
  id_provider: z.string().min(1, { message: "Product ID is required" }),
  quantity: z
    .number()
    .int({ message: "Quantity must be an integer" })
    .nonnegative({ message: "Quantity must be positive" }),
  title: z.string().optional().nullable(),
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
    price_mode: z.enum(["gross", "net"]).optional(),
    carrier: z.string().optional().nullable(),
    tax: z.number().min(0, "Tax is required"),
    payment_term: z.number().optional().nullable(),
    delivery_from: z.string().optional().nullable(),
    delivery_to: z.string().optional().nullable(),

    status: z.string().min(1, "Status is required"),
    netto_buyer_id: z.string().optional().nullable(),

    items: z.array(ManualOrderItemSchema).min(1, {
      message: "You must select at least one product",
    }),
    note: z.string().optional().nullable(),
    is_b2b: BooleanLikeSchema,
  })
  .superRefine((data, ctx) => {
    const normalizedMarketplace =
      typeof data.from_marketplace === "string"
        ? data.from_marketplace.trim().toLowerCase()
        : "";
    const isPrestigeMarketplace =
      data.from_marketplace === null ||
      normalizedMarketplace === "prestige" ||
      normalizedMarketplace === "prestige home";
    const invoiceEmail = (data.email ?? "").trim();

    if (isPrestigeMarketplace && invoiceEmail.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invoice email is required for Prestige Home channel",
        path: ["email"],
      });
    }

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
  price_mode: "gross",
  carrier: "",
  items: [],
  recipient_name: "",
  invoice_recipient_name: "",
  phone: "",
  invoice_phone: "",
  tax: 19,
  is_b2b: false,
};
