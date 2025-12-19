"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { currentVoucherAtom } from "@/store/voucher";
import { useAtom } from "jotai";
import { BadgePercent } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useGetVoucherByCode } from "@/features/vouchers/hook";
import { toast } from "sonner";

interface VoucherApplyProps {
  voucherId: string | null;
  setVoucherId: (voucherId: string | null) => void;
}

const VoucherApply = ({ voucherId, setVoucherId }: VoucherApplyProps) => {
  const t = useTranslations();
  const [, setCurrentVoucher] = useAtom(currentVoucherAtom);

  const [code, setCode] = useState("");
  const [submitCode, setSubmitCode] = useState<string | null>(null);

  // 🔎 Call API only after click Apply
  const { data, isFetching, isError } = useGetVoucherByCode(submitCode ?? "");

  // ✅ Handle success
  useEffect(() => {
    if (data?.id) {
      setCurrentVoucher(data.id);
      setVoucherId(data.id);
      toast.success(t("voucherApplied"));
    }
  }, [data]);

  // ❌ Handle invalid code
  useEffect(() => {
    if (isError && submitCode) {
      setCurrentVoucher(null);
      setVoucherId(null);
      toast.error(t("invalidVoucher"));
    }
  }, [isError]);

  const handleApply = () => {
    if (!code.trim()) return;
    setSubmitCode(code.trim());
  };

  return (
    <div className="flex items-center gap-2 md:w-1/3 w-full">
      <BadgePercent className="w-5 h-5 text-muted-foreground" />

      <Input
        placeholder={t("applyCoupons")}
        className="flex-1"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <Button
        type="button"
        onClick={handleApply}
        disabled={isFetching}
        className="bg-secondary/85 hover:bg-secondary"
        hasEffect
      >
        {isFetching ? t("checking") : t("apply")}
      </Button>
    </div>
  );
};

export default VoucherApply;
