import { z } from "zod";

export const getSignUpSchema = (t: any) =>
  z.object({
    email: z.string().min(1, t("emailRequired")).email(t("invalidEmail")),
    first_name: z.string().min(1, { message: t("first_name_required") }),
    last_name: z.string().min(1, { message: t("last_name_required") }),
    phone_number: z
      .string()
      .min(6, { message: t("phone_number_short") })
      .refine((val) => /^\+?[0-9]+$/.test(val), {
        message: t("phone_number_invalid"),
      }),
    gender: z.string().min(1, { message: t("gender_required") }),
  });

export type SignUpSchema = z.infer<ReturnType<typeof getSignUpSchema>>;
