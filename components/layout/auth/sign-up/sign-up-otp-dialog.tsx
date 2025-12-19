"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLoginOtpGuest, useSignUp } from "@/features/auth/hook";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useFormContext } from "react-hook-form";
import { useRouter } from "@/src/i18n/navigation";

interface SignUpOtpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SignUpSignUpOtpDialog({
  open,
  onOpenChange,
}: SignUpOtpDialogProps) {
  const form = useFormContext();
  const router = useRouter();
  const locale = useLocale();
  const [otpValues, setOtpValues] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const checkOtpMutation = useLoginOtpGuest();
  const signUp = useSignUp();

  const t = useTranslations();

  // -------------- GIỮ NGUYÊN LOGIC CỦA BẠN ----------------

  // Copy–paste toàn bộ 6 số
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("Text").trim();
    if (!/^\d{6}$/.test(pasteData)) return;
    setOtpValues(pasteData.split(""));
  };

  const handleSubmit = () => {
    const code = otpValues.join("");
    const { email, first_name, last_name, phone_number, gender } =
      form.getValues();
    if (code.length !== 6) {
      toast.error(t("otpRequired"));
      return;
    }

    checkOtpMutation.mutate(
      {
        code: code,
        email: email,
      },
      {
        onSuccess(data, variables, context) {
          signUp.mutate(
            {
              email,
              first_name,
              last_name,
              phone_number,
              gender,
              is_real: true,
            },
            {
              onSuccess() {
                form.reset();
                toast.success(t("signUpSuccess"));
                router.push("/login", { locale });
              },
              onError() {
                toast.error(t("signUpFail"));
              },
            },
          );
        },
        onError(error, variables, context) {
          toast.error("error");
        },
      },
    );
  };

  // Auto-submit khi đủ 6 số
  useEffect(() => {
    const code = otpValues.join("");
    if (code.length === 6) handleSubmit();
  }, [otpValues]);

  // ---------------- CUSTOM LOGIC CHO SHADCN INPUT OTP ----------------

  const handleChange = (val: string) => {
    // val = chuỗi gồm 0–6 ký tự
    const arr = val.split("").slice(0, 6);

    // Giữ lại dạng mảng đủ 6 ký tự
    const padded = [...arr, "", "", "", "", "", ""].slice(0, 6);
    setOtpValues(padded);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[400px] gap-2">
        <DialogHeader>
          <DialogTitle className="text-center">OTP</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-600 mb-4 text-center">
          {t("sendedEmail")}
        </p>

        {/* OTP SHADCN */}
        <div
          className="flex justify-center mb-4"
          onPaste={handlePaste}
        >
          <InputOTP
            maxLength={6}
            value={otpValues.join("")}
            onChange={handleChange}
          >
            <InputOTPGroup className="gap-2">
              {otpValues.map((_, idx) => (
                <InputOTPSlot
                  key={idx}
                  index={idx}
                  data-index={idx}
                  className="w-10 h-12 text-lg border rounded-md text-center"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          className="w-full bg-secondary/95 hover:bg-secondary"
          onClick={handleSubmit}
          disabled={checkOtpMutation.isPending}
        >
          {checkOtpMutation.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <div>{t("verifyOTP")}</div>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
