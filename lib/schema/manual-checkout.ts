import { z } from "zod"

export const ManualCreateOrderSchema = (t: (key: string) => string) => z.object({
  email: z.string().min(1, { message: t("email_required") }).email(t("invalid_email")),
  first_name: z.string().min(1, { message: t("first_name_required") }),
  last_name: z.string().min(1, { message: t("last_name_required") }),
  phone_number: z.string().optional(),
  address: z.string().min(1, { message: t("address_required") }),
  city: z.string().min(1, { message: t("city_required") }),
  country: z.string().min(1, { message: t("country_required") }),
  postal_code: z.string().min(1, { message: t("postal_required") }),
  
  invoice_address: z.string().optional(),
  invoice_city: z.string().optional(),
  invoice_country: z.string().optional(),
  invoice_postal_code: z.string().optional(),

  from_marketplace: z.string().optional(),
  marketplace_order_id: z.string().optional(),
  
  total_amount: z.number().optional(),
  total_amount_item: z.number().optional(),
  total_shipping: z.number().optional(),
  total_discount: z.number().optional(),
  carrier: z.string().optional(),

  items: z.array(
    z.object({
      product_id: z.string().min(1, { message: t("product_id_required") }),
      quantity: z.number().int().nonnegative({ message: t("quantity_invalid") }),
      title: z.string().optional(),
      sku: z.string().optional(),
      final_price: z.number().nonnegative({ message: t("price_invalid") }),
    })
  ).min(1, { message: t("items_required") }),
})

export type ManualCreateOrderFormValues = z.infer<ReturnType<typeof ManualCreateOrderSchema>>

export const manualCheckoutDefaultValues: ManualCreateOrderFormValues = {
  email: "",
  first_name: "",
  last_name: "",
  phone_number: "",
  address: "",
  city: "",
  country: "",
  postal_code: "",
  invoice_address: "",
  invoice_city: "",
  invoice_country: "",
  invoice_postal_code: "",
  from_marketplace: "",
  marketplace_order_id: "",
  total_amount: 0,
  total_amount_item: 0,
  total_shipping: 0,
  total_discount: 0,
  carrier: "",
  items: [],
}
