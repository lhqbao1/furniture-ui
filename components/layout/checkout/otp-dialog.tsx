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
import { useLoginOtp, useLoginOtpGuest } from "@/features/auth/hook";
import { useSyncLocalCart } from "@/features/cart/hook";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { useAtom } from "jotai";
import { userIdAtom } from "@/store/auth";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface OtpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onSuccess: (userId: string) => void;
  verifyOtp: (otpInput: string) => void;
}

export function OtpDialog({
  open,
  onOpenChange,
  email,
  onSuccess,
  verifyOtp,
}: OtpDialogProps) {
  const [otpValues, setOtpValues] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [, setUserId] = useAtom(userIdAtom);
  const loginOtpMutation = useLoginOtpGuest();
  const syncLocalCartMutation = useSyncLocalCart();
  const t = useTranslations();

  // -------------- GIỮ NGUYÊN LOGIC CỦA BẠN ----------------

  const updateOtpAt = (index: number, val: string) => {
    const newOtp = [...otpValues];
    newOtp[index] = val;
    setOtpValues(newOtp);
  };

  // Copy–paste toàn bộ 6 số
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("Text").trim();
    if (!/^\d{6}$/.test(pasteData)) return;
    setOtpValues(pasteData.split(""));
  };

  const handleSubmit = () => {
    const code = otpValues.join("");

    if (code.length !== 6) {
      toast.error(t("otpRequired"));
      return;
    }

    loginOtpMutation.mutate(
      { email, code },
      {
        onSuccess: (data, variables) => {
          verifyOtp(variables.code); // giữ nguyên logic

          // localStorage.setItem("access_token", data.access_token);
          // localStorage.setItem("userIdGuest", data.id);

          toast.success(t("otpDone"));
          // onSuccess(data.id);
          onOpenChange(false);
          // syncLocalCartMutation.mutate();
        },
        onError: () => toast.error(t("otpError")),
      },
    );
  };

  // Auto-submit khi đủ 6 số
  useEffect(() => {
    const code = otpValues.join("");
    if (code.length === 6) handleSubmit();
  }, [otpValues]);

  // ---------------- CUSTOM LOGIC CHO SHADCN INPUT OTP ----------------

  // const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
  //   const target = e.target as HTMLElement;
  //   const index = Number(target.getAttribute("data-index"));

  //   // Backspace → xóa và focus ngược lại
  //   if (e.key === "Backspace") {
  //     if (otpValues[index] === "" && index > 0) {
  //       const prev = document.querySelector(
  //         `[data-index="${index - 1}"]`,
  //       ) as HTMLElement;
  //       prev?.focus();
  //     }
  //     updateOtpAt(index, "");
  //   }
  // };

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
          disabled={loginOtpMutation.isPending}
        >
          {loginOtpMutation.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <div>{t("verifyOTP")}</div>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
