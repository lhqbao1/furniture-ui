import { z } from "zod"

export const addressSchema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  name_address: z.string().min(1, "Address name is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  recipient_name: z.string().min(1, "Recipient name is required"),
  address_line: z.string().min(1, "Address line is required"),
  is_default: z.boolean().optional(),
})

export type AddressFormValues = z.infer<typeof addressSchema>

export const addressDefaultValues: AddressFormValues = {
    user_id: "",
    name_address: "",
    city: "",
    postal_code: "",
    country: "",
    phone_number: "",
    recipient_name: "",
    address_line: "",
    is_default: false,
}