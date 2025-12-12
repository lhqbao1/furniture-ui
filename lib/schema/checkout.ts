import { optional, z } from "zod";

export const CreateOrderSchema = (t: (key: string) => string) =>
  z
    .object({
      shipping_address_id: z.string().optional(),
      invoice_address_id: z.string().optional(),
      payment_method: z.string().min(1, t("choose_payment_method")),
      note: z.string().optional().nullable(),
      coupon_amount: z.number().optional().nullable(),
      voucher_amount: z.number().optional().nullable(),
      terms: z
        .boolean()
        .refine((val) => val === true, { message: t("must_accept_terms") }),

      first_name: z.string().optional(),
      last_name: z.string().optional(),
      company_name: z.string().optional().nullable(),
      tax_id: z.string().optional().nullable(),

      invoice_address_line: z
        .string()
        .min(1, { message: t("address_required") }),
      invoice_postal_code: z.string().min(1, { message: t("postal_required") }),
      invoice_city: z.string().min(1, { message: t("city_required") }),
      invoice_country: z.string().min(1, { message: t("country_required") }),
      invoice_address_additional: z.string().optional(),
      shipping_address_additional: z.string().optional(),
      shipping_phone_number: z.string().optional().nullable(),
      shipping_recipient_name: z.string().optional().nullable(),
      gender: z.string().min(1, { message: t("gender_required") }),
      email: z.string().min(1, t("emailRequired")).email(t("invalidEmail")),
      phone_number: z
        .string()
        .min(6, { message: t("phone_number_short") })
        .refine((val) => /^\+?[0-9]+$/.test(val), {
          message: t("phone_number_invalid"),
        }),
      shipping_address_line: z
        .string()
        .min(1, { message: t("address_required") }),
      shipping_postal_code: z
        .string()
        .min(1, { message: t("postal_required") }),
      shipping_city: z.string().min(1, { message: t("city_required") }),
      shipping_country: z.string().min(1, { message: t("country_required") }),
      supplier_carts: z
        .array(
          z.object({
            cart_id: z.string(),
            supplier_id: z.string(),
          }),
        )
        .optional(),
      total_shipping: z.number().optional().nullable(),
    })
    .superRefine((values, ctx) => {
      // 1️⃣ Nếu có company → tax_id bắt buộc
      if (values.company_name && !values.tax_id) {
        ctx.addIssue({
          code: "custom",
          path: ["tax_id"],
          message: t("tax_id_required_when_company"),
        });
      }

      // 2️⃣ Nếu KHÔNG có company → first + last name required
      if (!values.company_name) {
        if (!values.first_name || values.first_name.trim() === "") {
          ctx.addIssue({
            code: "custom",
            path: ["first_name"],
            message: t("first_name_required"),
          });
        }

        if (!values.last_name || values.last_name.trim() === "") {
          ctx.addIssue({
            code: "custom",
            path: ["last_name"],
            message: t("last_name_required"),
          });
        }
      }
    });

export type CreateOrderFormValues = z.infer<
  ReturnType<typeof CreateOrderSchema>
>;

export const checkoutDefaultValues = {
  shipping_address_id: "",
  invoice_address_id: "",
  cart_id: "",
  payment_method: "paypal",
  note: "",
  coupon_amount: 0,
  voucher_amount: 0,
  terms: false,

  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  gender: "",

  invoice_address_line: "",
  invoice_postal_code: "",
  invoice_city: "",
  invoice_address_additional: "",
  invoice_country: "DE",

  shipping_address_line: "",
  shipping_postal_code: "",
  shipping_city: "",
  shipping_address_additional: "",
  shipping_country: "DE",
};

export const adminCheckoutDefaultValues = {
  shipping_address_id: "",
  invoice_address_id: "",
  cart_id: "",
  payment_method: "paypal",
  note: "",
  coupon_amount: 0,
  voucher_amount: 0,
  terms: true,

  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  gender: "",

  invoice_address_line: "",
  invoice_postal_code: "",
  invoice_city: "",
  invoice_address_additional: "",

  shipping_address_line: "",
  shipping_postal_code: "",
  shipping_city: "",
  shipping_address_additional: "",
};
