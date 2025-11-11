"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { UseMutationResult } from "@tanstack/react-query";

interface ResendOtpProps {
  username: string;
  isAdmin?: boolean;
  sendOtpMutation: UseMutationResult<any, any, string, any>;
  loginAdminMutation?: UseMutationResult<any, any, string, any>;
  initialCountdown?: number;
}

export default function ResendOtp({
  username,
  isAdmin = false,
  sendOtpMutation,
  loginAdminMutation,
  initialCountdown = 60,
}: ResendOtpProps) {
  const t = useTranslations();
  const [countdown, setCountdown] = useState(initialCountdown);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = () => {
    if (!username) return;

    const mutation = isAdmin ? loginAdminMutation : sendOtpMutation;

    mutation?.mutate(username, {
      onSuccess: () => {
        toast.success(t("sendedEmail"));
        setCountdown(initialCountdown);
        setCanResend(false);
      },
      onError: () => toast.error(t("invalidEmail")),
    });
  };

  return (
    <div className="text-sm text-gray-600 flex items-center justify-center gap-2 mt-2">
      {canResend ? null : (
        <span>
          {t("resendIn")} {countdown}s
        </span>
      )}
      <Button
        variant="link"
        type="button"
        size="sm"
        disabled={!canResend}
        onClick={handleResend}
        className="cursor-pointer underline p-0"
      >
        {t("resendOtp")}
      </Button>
    </div>
  );
}
