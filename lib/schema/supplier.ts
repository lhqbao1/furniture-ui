import { SupplierInput } from "@/types/supplier"
import { z } from "zod"

export const supplierSchema = z.object({
    business_name: z.string().min(1, "Business name is required"),
    vat_id: z.string().min(1, "VAT id is required"),
    email: z.string().email("Invalid email"),
    email_order: z.string().email("Invalid order email"),
    email_billing: z.string().email("Invalid billing email"),
    phone_number: z.string().min(5, "Invalid phone number"),
    delivery_multiple: z
    .boolean()
    .refine((val) => val === true || val === false, {
      message: "Delivery Type is required",
    }),
    })

  

export const defaultSupplier: SupplierInput = {
    business_name: "",
    vat_id: "",
    email: "",
    email_order: "",
    email_billing: "",
    phone_number: "",
    delivery_multiple: false
  }

