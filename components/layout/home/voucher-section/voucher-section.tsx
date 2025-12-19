import React from "react";
import TransactionCard, { VoucherType } from "./voucher-card";
import { VoucherResponse } from "@/types/voucher";
import { useTranslations } from "next-intl";

interface VoucherSectionProps {
  vouchers: VoucherResponse;
}

const VoucherSection = ({ vouchers }: VoucherSectionProps) => {
  const t = useTranslations("voucher");

  const getVoucherSubtitle = (type: VoucherType) => {
    return t(`${type}`);
  };

  const formatVoucherValue = (type: string, value: number) => {
    return t(`${type}`, { value });
  };

  return (
    <section className="bg-secondary/5 md:py-16 py-6">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {vouchers.slice(0, 4).map((item, index) => {
            return (
              <TransactionCard
                key={item.id}
                status={item.type as VoucherType}
                title={item.code}
                subtitle={getVoucherSubtitle(item.type as VoucherType)}
                highlightText={formatVoucherValue(
                  item.discount_type,
                  item.discount_value,
                )}
                footerText="Thank you for your payment."
                id={item.id}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default VoucherSection;
