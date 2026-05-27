import { z } from "zod";

export const affiliateSchema = z.object({
  name: z.string().trim().min(1, "Affiliate name is required"),
  code: z.string().trim().min(1, "Affiliate code is required"),
  weight: z.number().min(0, "Weight must be greater than or equal to 0"),
  commission_rate: z
    .number()
    .min(0, "Commission rate must be greater than or equal to 0"),
});

export type AffiliateFormValues = z.infer<typeof affiliateSchema>;

export const affiliateDefaultValues: AffiliateFormValues = {
  name: "",
  code: "",
  weight: 0,
  commission_rate: 0,
};

export const affiliateByIdSchema = z.object({
  id: z.string().uuid("Affiliate ID must be a valid UUID"),
});

export type AffiliateByIdValues = z.infer<typeof affiliateByIdSchema>;

export const affiliateGenerateLinkSchema = z.object({
  affiliate_id: z.string().uuid("Affiliate ID must be a valid UUID"),
  expire_in: z
    .number()
    .int("Expire hours must be an integer")
    .min(1, "Expire hours must be at least 1")
    .max(720, "Expire hours must be at most 720")
    .optional(),
});

export type AffiliateGenerateLinkValues = z.infer<
  typeof affiliateGenerateLinkSchema
>;
