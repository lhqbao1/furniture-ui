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
import { Loader2, Mail } from "lucide-react";
import {
  useCheckMailExist,
  useLoginOtp,
  useSendOtp,
} from "@/features/auth/hook";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSyncLocalCart } from "@/features/cart/hook";
import { useQueryClient } from "@tanstack/react-query";
import LoginGoogleButton from "../../shared/login-google-button";
import ResendOtp from "../auth/resend-otp";
import { useAtom } from "jotai";
import { userIdAtom } from "@/store/auth";
import { Link, useRouter } from "@/src/i18n/navigation";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../../ui/input-otp";

interface HeaderLoginFormProps {
  onSuccess?: () => void;
}

export default function HeaderLoginForm({ onSuccess }: HeaderLoginFormProps) {
  const [seePassword, setSeePassword] = useState(false);
  const t = useTranslations();
  const queryClient = useQueryClient();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [userId, setUserId] = useAtom(userIdAtom);
  const locale = useLocale();
  const router = useRouter();
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

  const syncLocalCartMutation = useSyncLocalCart();
  const sendOtpMutation = useSendOtp();
  const submitOtpMutation = useLoginOtp();
  const checkMailExistMutation = useCheckMailExist();

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (!seePassword) {
      checkMailExistMutation.mutate(values.username, {
        onSuccess: (data) => {
          if (data === true) {
            toast.error(t("emailNotRegistered"));
          } else {
            sendOtpMutation.mutate(values.username, {
              onSuccess: (data) => {
                toast.success(t("sendedEmail"));
                setSeePassword(true);
              },
              onError(error, variables, context) {
                toast.error(t("invalidEmail"));
              },
            });
          }
        },
        onError(error, variables, context) {
          console.log(error);
        },
      });
    } else {
      submitOtpMutation.mutate(
        {
          email: values.username,
          code: values.code ?? "",
        },
        {
          onSuccess(data, variables, context) {
            const token = data.access_token;
            localStorage.setItem("access_token", token);
            setUserId(data.id);
            localStorage.setItem("userId", data.id);
            queryClient.refetchQueries({ queryKey: ["me"], exact: true });
            queryClient.refetchQueries({
              queryKey: ["cart-items", data.id],
              exact: false,
            });
            syncLocalCartMutation.mutate();
            toast.success(t("loginSuccess"));
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
        onSuccess(data, variables, context) {
          const token = data.access_token;
          localStorage.setItem("access_token", token);
          localStorage.setItem("userId", data.id);
          setUserId(data.id);
          queryClient.refetchQueries({ queryKey: ["me"], exact: true });
          queryClient.refetchQueries({
            queryKey: ["cart-items", data.id],
            exact: false,
          });
          syncLocalCartMutation.mutate();

          toast.success(t("loginSuccess"));

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

      {/* Sign up link */}
      <div className="text-sm text-center mt-6 space-x-1">
        <span>{t("noAccount")}</span>
        <Link
          href="/sign-up"
          locale={locale}
          className="font-medium text-secondary hover:underline"
        >
          {t("createAccount")}
        </Link>
        {/* <Button
          className="font-medium text-secondary hover:underline"
          variant={"ghost"}
          onClick={() => router.push("/sign-up", { locale })}
        >
          {t("createAccount")}
        </Button> */}
      </div>
      <LoginGoogleButton />
    </div>
  );
}
