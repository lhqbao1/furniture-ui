import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "You must provide category name"),
  img_url: z.any().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  level: z.number(),
  parent_id: z.string().optional()
});
