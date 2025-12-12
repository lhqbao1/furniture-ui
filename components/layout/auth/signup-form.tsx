"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@/src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { useCheckMailExist, useSendOtp, useSignUp } from "@/features/auth/hook";
import { getSignUpSchema, SignUpSchema } from "@/lib/schema/sign-up";
import SignUpFields from "./sign-up/sign-up-fields";
import LogoHeader from "./sign-up/logo-header";
import { useState } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import GenderSelect from "./sign-up/gender-select";
import SignUpSignUpOtpDialog from "./sign-up/sign-up-otp-dialog";
import AGBDialogTrigger from "./sign-up/agb-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import WiderrufPage from "@/src/app/[locale]/(sticky)/cancellation/page";
import WiderrufDialogTrigger from "./sign-up/widderuf-dialog";

export default function SignUpForm() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const [openDialog, setOpenDialog] = useState<boolean>(false);

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
      agree_agb: false,
    },
  });

  const checkMailMutation = useCheckMailExist();
  const sendOtpMutation = useSendOtp();

  const handleSubmit = (values: SignUpSchema) => {
    checkMailMutation.mutate(values.email, {
      onSuccess(data) {
        if (data === false) {
          toast.error(t("emailAlreadyUsed"));
        } else {
          sendOtpMutation.mutate(values.email);
          setOpenDialog(true);
        }
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
          <>
            {/* Gender */}
            <div className="md:col-span-2 col-span-1">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <GenderSelect
                    value={field.value}
                    onChange={field.onChange}
                    t={t}
                  />
                )}
              />
            </div>

            {/* First Name */}
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("first_name")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last Name */}
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("last_name")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("email")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("phone_number")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="+49"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>

          {/* Agree AGB */}
          <FormField
            control={form.control}
            name="agree_agb"
            render={({ field }) => (
              <FormItem className="flex items-start gap-3 md:col-span-2 col-span-1">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="h-5 w-5"
                  />
                </FormControl>

                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm block">
                    {t("agreeTo")} <AGBDialogTrigger t={t} /> {t("and")}
                    <WiderrufDialogTrigger t={t} /> {t("agree_widderuf")}
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <div className="col-span-1 md:col-span-2 flex justify-center mt-4">
            <Button
              type="submit"
              className="bg-primary/90 hover:bg-primary lg:px-12 px-4 py-6 text-lg"
              hasEffect
            >
              {sendOtpMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <div className="capitalize">{t("createAccount")}</div>
              )}
            </Button>
          </div>
          <SignUpSignUpOtpDialog
            open={openDialog}
            onOpenChange={setOpenDialog}
          />
        </form>
      </Form>
    </div>
  );
}
