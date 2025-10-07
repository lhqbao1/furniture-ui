export interface SupplierInput {
    salutation: string
    business_name: string
    vat_id: string
    email: string
    email_order: string
    email_billing: string
    phone_number: string
}

export interface SupplierResponse {
    salutation: string
    business_name
  vat_id: string
  email: string
  email_order: string
  email_billing: string
  phone_number: string
  id: string
  created_at: string
  updated_at: string
}