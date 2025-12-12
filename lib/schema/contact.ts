import z from "zod";

export const contactFormSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  subject: z.string().min(1, "Bitte wählen Sie ein Thema aus"),
  order_id: z.string().optional(),
  message: z.string().min(1, "Bitte geben Sie eine Nachricht ein"),
  file_url: z.string().optional(),
});
