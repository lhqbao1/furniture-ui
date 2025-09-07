import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "You must provide category name"),
  img_url: z.any().optional(),
  meta_title: z.string(),
  meta_description: z.string(),
  meta_keywords: z.string(),
  level: z.number(),
  parent_id: z.string().optional()
});
