import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "You must provide category name"),
  img_url: z.any().optional(),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
  meta_keywords: z.string().optional().nullable(),
  level: z.number(),
  parent_id: z.string().optional(),
  code: z.string().optional(),
  is_econelo: z.boolean(),
});
