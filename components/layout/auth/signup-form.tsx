"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@/src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { useCheckMailExist, useSignUp } from "@/features/auth/hook";
import { getSignUpSchema, SignUpSchema } from "@/lib/schema/sign-up";
import SignUpFields from "./sign-up/sign-up-fields";
import LogoHeader from "./sign-up/logo-header";

export default function SignUpForm() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();

  const schema = getSignUpSchema(t);

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      gender: "",
      is_real: true,
    },
  });

  const signUp = useSignUp();
  const checkMailMutation = useCheckMailExist();

  const handleSubmit = (values: SignUpSchema) => {
    checkMailMutation.mutate(values.email, {
      onSuccess() {
        signUp.mutate(values, {
          onSuccess() {
            form.reset();
            toast.success(t("signUpSuccess"));
            router.push("/login", { locale });
          },
          onError() {
            toast.error(t("signUpFail"));
          },
        });
      },
      onError() {
        toast.error(t("useDifferentEmail"));
      },
    });
  };

  return (
    <div className="w-full p-6">
      <LogoHeader t={t} />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <SignUpFields
            form={form}
            t={t}
          />

          <div className="col-span-1 md:col-span-2 flex justify-center mt-4">
            <Button
              type="submit"
              className="bg-primary/90 hover:bg-primary lg:px-12 px-4 py-6 text-lg"
              hasEffect
            >
              {signUp.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <div className="capitalize">{t("createAccount")}</div>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
