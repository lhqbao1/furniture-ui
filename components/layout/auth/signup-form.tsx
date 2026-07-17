"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@/src/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { useCheckMailExist, useSendOtp } from "@/features/auth/hook";
import { getSignUpSchema, SignUpSchema } from "@/lib/schema/sign-up";
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
import WiderrufDialogTrigger from "./sign-up/widderuf-dialog";

const inputClassName =
  "h-12 rounded-xl border-slate-200 bg-white pl-10 text-base shadow-sm transition-[border-color,box-shadow] placeholder:text-slate-400 focus-visible:border-secondary/70 focus-visible:ring-secondary/20 md:text-sm";

export default function SignUpForm() {
  const t = useTranslations();
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
  const isSubmitting = checkMailMutation.isPending || sendOtpMutation.isPending;

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
    <div className="w-full max-w-3xl rounded-3xl border border-secondary/10 bg-white/90 p-5 shadow-2xl shadow-slate-200/70 backdrop-blur sm:p-8 xl:p-10">
      <LogoHeader t={t} />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="grid grid-cols-1 gap-5 md:grid-cols-2"
        >
          <>
            {/* Gender */}
            <div className="col-span-1 md:col-span-2">
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
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-slate-700">
                    {t("first_name")}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <UserRound
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      />
                      <Input
                        autoComplete="given-name"
                        className={inputClassName}
                        {...field}
                      />
                    </div>
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
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-slate-700">
                    {t("last_name")}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <UserRound
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      />
                      <Input
                        autoComplete="family-name"
                        className={inputClassName}
                        {...field}
                      />
                    </div>
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
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-slate-700">
                    {t("email")}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      />
                      <Input
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        spellCheck={false}
                        className={inputClassName}
                        {...field}
                      />
                    </div>
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
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-slate-700">
                    {t("phone_number")}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      />
                      <Input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="+49…"
                        className={inputClassName}
                        {...field}
                      />
                    </div>
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
              <FormItem className="col-span-1 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:col-span-2">
                <div className="flex items-start gap-3">
                  <FormControl>
                    <Checkbox
                      id="signup-agree-agb"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-0.5 h-5 w-5 rounded-md border-slate-300 data-[state=checked]:border-secondary data-[state=checked]:bg-secondary"
                    />
                  </FormControl>

                  <div className="min-w-0 space-y-1 leading-6">
                    <FormLabel
                      htmlFor="signup-agree-agb"
                      className="block cursor-pointer text-sm text-slate-700"
                    >
                      {t("agreeTo")} <AGBDialogTrigger t={t} /> {t("and")}
                      <WiderrufDialogTrigger t={t} /> {t("agree_widderuf")}
                    </FormLabel>
                    <FormMessage />
                  </div>
                </div>
              </FormItem>
            )}
          />

          <div className="col-span-1 mt-2 flex flex-col items-center gap-4 md:col-span-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl bg-primary px-6 text-base font-semibold text-white shadow-lg shadow-primary/20 transition-[background-color,box-shadow,transform] hover:bg-primary/90 hover:shadow-primary/30 md:w-[260px]"
              hasEffect
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              )}
              <span>{t("createAccount")}</span>
            </Button>
            <p className="text-sm text-muted-foreground">
              Bereits registriert?{" "}
              <Link
                href="/login"
                className="font-medium text-secondary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30"
              >
                {t("login")}
              </Link>
            </p>
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
