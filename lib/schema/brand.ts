import { StaticFile } from "@/types/products";
import { z } from "zod";
const StaticFileSchema = z.object({
  url: z.string(),
});

export const brandFormSchema = z.object({
  name: z.string().min(1, "You need provide brand name"),
  img_url: z.string().optional().nullable(),
  company_name: z.string().min(1, "Company name is required"),
  company_address: z.string().min(1, "Company address is required"),
  company_email: z.string().email().min(1, "Company email is required"),
  company_city: z.string().min(1, "Company city is required"),
  company_postal_code: z.string().min(1, "Company postal code is required"),
  company_country: z.string().min(1, "Company country is required"),
});

export const brandDefaultValues = {
  name: "",
  company_name: "",
  company_address: "",
  company_email: "",
  company_city: "",
  company_postal_code: "",
  company_country: "",
};

export type BrandFormValues = z.infer<typeof brandFormSchema>;
