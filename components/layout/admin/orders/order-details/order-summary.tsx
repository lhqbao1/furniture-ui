import { User } from "@/types/user";
import React from "react";

type VatSummaryRow = {
  percent: number;
  vat: number;
};

interface OrderInformationProps {
  payment_method?: string;
  language: string;
  external_id?: string;
  warehouse?: string;
  referrer?: string;
  owner?: User;
  order_type?: string;
  shipping_profile?: string;
  package_number?: string;
  entry_date?: Date;
  client?: string;
  sub_total?: number;
  shipping_amount?: number;
  discount_amount?: number;
  tax?: number;
  vat_rows?: VatSummaryRow[];
  total_amount?: number;
  is_Ebay?: boolean;
  refund_amount: number | null;
}

const OrderSummary = ({
  payment_method,
  language,
  external_id,
  warehouse,
  referrer,
  owner,
  order_type,
  shipping_profile,
  package_number,
  entry_date,
  client,
  sub_total,
  shipping_amount,
  discount_amount,
  tax,
  vat_rows = [],
  total_amount,
  refund_amount,
  is_Ebay = false,
}: OrderInformationProps) => {
  const formatEuro = (value: number | undefined) =>
    `€${(value ?? 0).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatVatLabel = (percent: number) => {
    const safePercent = Number(percent) || 0;
    const isInteger = Number.isInteger(safePercent);

    return `VAT (${safePercent.toLocaleString("de-DE", {
      minimumFractionDigits: isInteger ? 0 : 2,
      maximumFractionDigits: isInteger ? 0 : 2,
    })}%)`;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">Summary</h3>
      </div>

      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-slate-600">Sub total</div>
          <div className="text-right font-medium text-slate-900">
            {formatEuro(sub_total)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-slate-600">Shipping</div>
          <div className="text-right font-medium text-slate-900">
            {formatEuro(shipping_amount)}
          </div>
        </div>
        {discount_amount && discount_amount > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="text-slate-600">Discount (gross)</div>
            <div className="text-right font-medium text-slate-900">
              {formatEuro(discount_amount)}
            </div>
          </div>
        ) : null}
        {vat_rows.length > 0 ? (
          vat_rows.map((row) => (
            <div
              className="grid grid-cols-2 gap-3"
              key={`vat-row-${row.percent}`}
            >
              <div className="text-slate-600">
                {formatVatLabel(row.percent)}
              </div>
              <div className="text-right font-medium text-slate-900">
                {formatEuro(row.vat)}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="text-slate-600">VAT</div>
            <div className="text-right font-medium text-slate-900">
              {formatEuro(tax)}
            </div>
          </div>
        )}
        {refund_amount && refund_amount > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="text-slate-600">Refund Amount</div>
            <div className="text-right font-medium text-red-600">
              -{formatEuro(refund_amount)}
            </div>
          </div>
        ) : null}

        <div className="my-2 h-px w-full bg-slate-200" />

        <div className="grid grid-cols-2 gap-3 text-base">
          <div className="font-semibold text-slate-900">Total</div>
          <div className="text-right text-xl font-bold text-primary">
            {formatEuro(total_amount)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
