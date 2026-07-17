"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound, Loader2, Mail, ShieldCheck } from "lucide-react";
import {
  useCheckMailExist,
  useLoginOtp,
  useSendOtpAffiliate,
  useSendOtp,
  useSendOtpAdmin,
} from "@/features/auth/hook";
import { toast } from "sonner";
import Image from "next/image";
import { useRef, useState } from "react";
import { Link, useRouter } from "@/src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSyncLocalCart } from "@/features/cart/hook";
import LoginGoogleButton from "@/components/shared/login-google-button";
import ResendOtp from "./resend-otp";
import { useAtom } from "jotai";
import { adminIdAtom, userIdAtom } from "@/store/auth";
import { cn } from "@/lib/utils";

const inputClassName =
  "h-12 rounded-xl border-slate-200 bg-white pl-10 text-base shadow-sm transition-[border-color,box-shadow] placeholder:text-slate-400 focus-visible:border-secondary/70 focus-visible:ring-secondary/20 md:text-sm";

const otpInputClassName =
  "h-12 min-w-0 flex-1 rounded-xl border-slate-200 bg-white text-center text-lg font-semibold shadow-sm transition-[border-color,box-shadow] focus-visible:border-secondary/70 focus-visible:ring-secondary/20";

interface LoginFormProps {
  isAdmin?: boolean;
  isAffiliate?: boolean;
  redirectTo?: string;
}

export default function LoginForm({
  isAdmin = false,
  isAffiliate = false,
  redirectTo,
}: LoginFormProps) {
  const [, setUserId] = useAtom(userIdAtom);
  const [, setAdminUserId] = useAtom(adminIdAtom);
  const [seePassword, setSeePassword] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const formSchema = z.object({
    username: z.string().min(1, t("emailRequired")).email(t("invalidEmail")),
    code: z.string().optional().nullable(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  const loginAdminMutation = useSendOtpAdmin();
  const loginAffiliateMutation = useSendOtpAffiliate();
  const syncLocalCartMutation = useSyncLocalCart();
  const sendOtpMutation = useSendOtp();
  const submitOtpMutation = useLoginOtp();
  const checkMailExistMutation = useCheckMailExist();
  const isAdminOrAffiliate = isAdmin || isAffiliate;
  const isSendingOtp =
    checkMailExistMutation.isPending ||
    sendOtpMutation.isPending ||
    loginAdminMutation.isPending ||
    loginAffiliateMutation.isPending;
  const isButtonLoading = isSendingOtp || submitOtpMutation.isPending;
  const loginSubtitle = seePassword
    ? t("loginOtpSubtitle")
    : isAdmin
      ? t("adminLoginSubtitle")
      : isAffiliate
        ? t("affiliateLoginSubtitle")
        : t("loginSubtitle");

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (!seePassword && !isAdminOrAffiliate) {
      checkMailExistMutation.mutate(values.username, {
        onSuccess: (data) => {
          if (data === true) {
            toast.error(t("emailNotRegistered"));
          } else {
            sendOtpMutation.mutate(values.username, {
              onSuccess: () => {
                toast.success(t("sendedEmail"));
                setSeePassword(true);
              },
              onError() {
                toast.error(t("invalidEmail"));
              },
            });
          }
        },
        onError(error) {
          console.log(error);
        },
      });
    } else if (isAdminOrAffiliate && !seePassword) {
      const loginMutation = isAffiliate
        ? loginAffiliateMutation
        : loginAdminMutation;

      loginMutation.mutate(values.username, {
        onSuccess: () => {
          toast.success(t("sendedEmail"));
          setSeePassword(true);
        },
        onError() {
          toast.error(t("invalidEmail"));
        },
      });
    } else if (seePassword && !isAdminOrAffiliate) {
      submitOtpMutation.mutate(
        {
          email: values.username,
          code: values.code ?? "",
        },
        {
          onSuccess: (data) => {
            // Giả sử backend trả về token
            const token = data.access_token;

            localStorage.setItem("access_token", token);
            router.push("/", { locale });
            setUserId(data.id);

            syncLocalCartMutation.mutate();

            toast.success(t("loginSuccess"));
          },
          onError() {
            toast.error(t("invalidCredentials"));
          },
        },
      );
    } else if (seePassword && isAdminOrAffiliate) {
      submitOtpMutation.mutate(
        {
          email: values.username,
          code: values.code ?? "",
        },
        {
          onSuccess: (data) => {
            // Giả sử backend trả về token
            const token = data.access_token;
            localStorage.setItem("admin_access_token", token);
            router.push(redirectTo ?? "/admin", { locale });
            setAdminUserId(data.id);

            // Có thể lưu userId nếu cần
            toast.success(t("loginSuccess"));
          },
          onError() {
            toast.error(t("invalidCredentials"));
          },
        },
      );
    }
  };

  const handleAutoSubmitOtp = (code: string) => {
    if (code.length !== 6) return;

    if (!isAdminOrAffiliate) {
      submitOtpMutation.mutate(
        {
          email: form.getValues("username"),
          code,
        },
        {
          onSuccess: (data) => {
            const token = data.access_token;
            localStorage.setItem("access_token", token);
            setUserId(data.id);
            router.push("/", { locale });
            syncLocalCartMutation.mutate();
            toast.success(t("loginSuccess"));
          },
          onError() {
            toast.error(t("invalidOTP"));
          },
        },
      );
    } else {
      submitOtpMutation.mutate(
        {
          email: form.getValues("username"),
          code,
        },
        {
          onSuccess: (data) => {
            const token = data.access_token;
            localStorage.setItem("admin_access_token", token);
            setAdminUserId(data.id);
            router.push(redirectTo ?? "/admin", { locale });
            toast.success(t("loginSuccess"));
          },
          onError() {
            toast.error(t("invalidOTP"));
          },
        },
      );
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-secondary/10 bg-white/90 p-5 shadow-2xl shadow-slate-200/70 backdrop-blur sm:p-8 xl:p-10">
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-secondary/10 bg-white shadow-sm">
          <Image
            src="/new-logo.svg"
            width={52}
            height={52}
            alt="Prestige Home"
            priority
          />
        </div>
        <div className="space-y-3">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-secondary">
            {isAdmin || isAffiliate ? (
              isAdmin ? (
                t("adminLoginTitle")
              ) : (
                t("affiliateLoginTitle")
              )
            ) : (
              <>
                <span>{t("welcomeTo")}</span>
                <span
                  className="ml-2 text-primary"
                  translate="no"
                >
                  Prestige Home
                </span>
              </>
            )}
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            {loginSubtitle}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit(
            (values) => {
              handleSubmit(values);
            },
            (errors) => {
              // toast.error("Please check the form for errors")
              console.log(errors);
            },
          )}
        >
          <FormField
            control={form.control}
            name="username"
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
                      placeholder={t("email")}
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      spellCheck={false}
                      className={cn(
                        inputClassName,
                        seePassword && "bg-slate-50 text-slate-500",
                      )}
                      disabled={seePassword}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {seePassword ? (
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => {
                return (
                  <FormItem className="space-y-3">
                    <div className="flex items-center gap-2">
                      <KeyRound
                        aria-hidden="true"
                        className="h-4 w-4 text-secondary"
                      />
                      <FormLabel className="text-sm font-medium text-slate-700">
                        {t("verifyOTP")}
                      </FormLabel>
                    </div>
                    <FormControl>
                      <div className="flex w-full justify-center gap-2">
                        {Array.from({ length: 6 }).map((_, idx) => (
                          <Input
                            key={idx}
                            id={`otp-${idx}`}
                            value={field.value?.[idx] ?? ""}
                            ref={(el) => (inputRefs.current[idx] = el)}
                            onChange={(e) => {
                              const val = e.target.value
                                .replace(/\D/g, "")
                                .slice(-1); // chỉ số 1 ký tự
                              const current = field.value ?? "";
                              const newValue =
                                current.substring(0, idx) +
                                val +
                                current.substring(idx + 1);

                              field.onChange(newValue);

                              // tự động focus sang input kế
                              if (val && idx < 5) {
                                const next = document.getElementById(
                                  `otp-${idx + 1}`,
                                ) as HTMLInputElement;
                                next?.focus();
                              }

                              if (idx === 5) {
                                handleAutoSubmitOtp(newValue);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key !== "Backspace") return;
                              const current = field.value ?? "";
                              const hasValue = current[idx];

                              if (hasValue) {
                                const newValue =
                                  current.substring(0, idx) +
                                  "" +
                                  current.substring(idx + 1);
                                field.onChange(newValue);
                                e.preventDefault();
                                return;
                              }

                              if (idx > 0) {
                                const prevIndex = idx - 1;
                                const newValue =
                                  current.substring(0, prevIndex) +
                                  "" +
                                  current.substring(prevIndex + 1);
                                field.onChange(newValue);
                                inputRefs.current[prevIndex]?.focus();
                                e.preventDefault();
                              }
                            }}
                            onPaste={(e) => {
                              e.preventDefault();
                              const pasted = e.clipboardData
                                .getData("text")
                                .replace(/\D/g, "");
                              if (!pasted) return;

                              const newValue = field.value ?? "";
                              const arr = newValue.split("");

                              // điền lần lượt vào các ô
                              for (let i = 0; i < 6; i++) {
                                arr[i] = pasted[i] ?? arr[i] ?? "";
                              }

                              const finalValue = arr.join("").slice(0, 6);
                              field.onChange(finalValue);

                              // focus ô cuối cùng có ký tự
                              const nextIndex = Math.min(pasted.length, 6) - 1;
                              inputRefs.current[nextIndex]?.focus();

                              if (finalValue.length === 6) {
                                handleAutoSubmitOtp(finalValue);
                              }
                            }}
                            className={otpInputClassName}
                            maxLength={1}
                            inputMode="numeric" // ✅ hiển thị bàn phím số trên mobile
                            pattern="[0-9]*" // ✅ chỉ chấp nhận số
                            type="text" // tránh lỗi autofill của Safari
                            autoComplete="one-time-code" // ✅ hỗ trợ autofill OTP (iOS, Android)
                          />
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          ) : null}
          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-primary px-6 text-base font-semibold text-white shadow-lg shadow-primary/20 transition-[background-color,box-shadow,transform] hover:bg-primary/90 hover:shadow-primary/30"
            hasEffect
            disabled={isButtonLoading}
          >
            {isButtonLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{seePassword ? t("login") : t("getOtp")}</span>
          </Button>
          {seePassword && (
            <ResendOtp
              username={form.getValues("username")}
              isAdmin={isAdmin}
              sendOtpMutation={sendOtpMutation}
              loginAdminMutation={loginAdminMutation}
              initialCountdown={60}
            />
          )}
        </form>
      </Form>

      {!isAdmin && (
        <div className="mt-6 rounded-2xl bg-slate-50 p-3 text-center text-sm text-muted-foreground">
          <span>{t("noAccount")}</span>
          <Link
            href={`/sign-up`}
            className="ml-1 font-medium text-secondary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30"
          >
            {t("createAccount")}
          </Link>
        </div>
      )}
      {!isAdmin && <LoginGoogleButton />}
    </div>
  );
}
