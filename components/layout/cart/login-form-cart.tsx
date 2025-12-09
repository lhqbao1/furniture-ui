"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Key, Loader2, Eye, EyeOff } from "lucide-react";
import { useLogin, useLoginOtp, useSendOtp } from "@/features/auth/hook";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSyncLocalCart } from "@/features/cart/hook";
import { useCartLocal } from "@/hooks/cart";
import { Link, useRouter } from "@/src/i18n/navigation";
import LoginGoogleButton from "@/components/shared/login-google-button";
import ResendOtp from "../auth/resend-otp";
import { useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { userIdAtom } from "@/store/auth";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface CartLoginFormProps {
  onSuccess?: () => void;
  onError?: () => void;
}

export default function CartLoginForm({
  onSuccess,
  onError,
}: CartLoginFormProps) {
  const [seePassword, setSeePassword] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const queryClient = useQueryClient();
  const [userId, setUserId] = useAtom(userIdAtom);

  const { cart: localCart } = useCartLocal();

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

  const loginMutation = useLogin();
  const syncLocalCartMutation = useSyncLocalCart();
  const sendOtpMutation = useSendOtp();
  const submitOtpMutation = useLoginOtp();

  const handleRedirectToCheckOut = () => {
    if (!localCart || localCart.length === 0) {
      toast.error(t("chooseAtLeastCart"));
      return;
    }

    router.prefetch("/check-out", { locale }); // 🔥 preload đúng cách

    router.push("/check-out");
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (!seePassword) {
      sendOtpMutation.mutate(values.username, {
        onSuccess: (data) => {
          toast.success(t("sendedEmail"));
          setSeePassword(true);
        },
        onError(error, variables, context) {
          toast.error(t("invalidEmail"));
        },
      });
    } else {
      submitOtpMutation.mutate(
        {
          email: values.username,
          code: values.code ?? "",
        },
        {
          onSuccess: (data) => {
            const token = data.access_token;
            localStorage.setItem("access_token", token);
            localStorage.setItem("userId", data.id);
            setUserId(data.id);
            syncLocalCartMutation.mutate();

            toast.success(t("loginSuccess"));
            router.push("/check-out", { locale });
            // gọi callback onSuccess nếu được truyền
            if (onSuccess) onSuccess();
          },
          onError(error) {
            toast.error(t("invalidCredentials"));
          },
        },
      );
    }
  };

  const handleAutoSubmitOtp = (code: string) => {
    if (code.length !== 6) return;

    submitOtpMutation.mutate(
      {
        email: form.getValues("username"),
        code,
      },
      {
        onSuccess: (data) => {
          const token = data.access_token;
          localStorage.setItem("access_token", token);
          localStorage.setItem("userId", data.id);
          setUserId(data.id);
          syncLocalCartMutation.mutate();
          queryClient.invalidateQueries({
            queryKey: ["cart-items"],
            exact: false,
          });
          toast.success(t("loginSuccess"));
          router.push("/check-out", { locale });
          // gọi callback onSuccess nếu được truyền
          if (onSuccess) onSuccess();
        },
        onError(error) {
          toast.error(t("invalidCredentials"));
        },
      },
    );
  };

  return (
    <div className="p-6 bg-white rounded-2xl w-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6"
        >
          {/* Email */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder={t("email")}
                      {...field}
                      className="pl-12 py-3 h-fit"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          {/* {seePassword ? (
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex gap-2 justify-center mb-4 w-full">
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <Input
                          key={idx}
                          id={`otp-${idx}`}
                          value={field.value?.[idx] ?? ""}
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
                          className="h-12 flex-1 text-center text-lg"
                          maxLength={1}
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
              )}
            />
          ) : (
            ""
          )} */}
          {seePassword ? (
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex justify-center mb-4 w-full">
                      {/* SHADCN OTP INPUT */}
                      <InputOTP
                        maxLength={6}
                        value={field.value ?? ""}
                        onChange={(val) => {
                          field.onChange(val);

                          // tự động submit khi đủ 6 số
                          if (val.length === 6) {
                            handleAutoSubmitOtp(val);
                          }
                        }}
                      >
                        <InputOTPGroup className="gap-2">
                          {Array.from({ length: 6 }).map((_, idx) => (
                            <InputOTPSlot
                              key={idx}
                              index={idx}
                              className="
                                w-10 h-12 text-lg 
                                flex items-center justify-center 
                                border rounded-md
                              "
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            ""
          )}

          <div className="space-y-2">
            <Button
              type="submit"
              className="w-full bg-secondary/95 hover:bg-secondary"
              hasEffect
              disabled={
                submitOtpMutation.isPending || sendOtpMutation.isPending
              }
            >
              {sendOtpMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : seePassword ? (
                submitOtpMutation.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  t("login")
                )
              ) : (
                t("getOtp")
              )}
            </Button>
            <Button
              type="button"
              variant={"outline"}
              disabled={loginMutation.isPending}
              onClick={() => handleRedirectToCheckOut()}
              className="w-full active:scale-95 active:bg-accent"
            >
              {t("continueAsGuest")}
            </Button>

            {seePassword && (
              <ResendOtp
                username={form.getValues("username")}
                isAdmin={false}
                sendOtpMutation={sendOtpMutation}
                initialCountdown={60}
              />
            )}
          </div>
        </form>
      </Form>

      {/* Forgot password */}
      <div className="text-sm text-center mt-6 space-x-1">
        <span>{t("noAccount")}</span>
        <Link
          href={`/sign-up`}
          className="font-medium text-secondary hover:underline"
        >
          {t("createAccount")}
        </Link>
      </div>
      <LoginGoogleButton />
    </div>
  );
}
