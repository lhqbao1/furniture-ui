import { Button } from "@/components/ui/button";
import { VoucherItem } from "@/types/voucher";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

interface ProductVoucherProps {
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  item: VoucherItem;
  isLoadingVoucher: boolean;
}

const ProductVoucher = ({
  isSelected,
  onSelect,
  item,
  isLoadingVoucher,
}: ProductVoucherProps) => {
  const t = useTranslations();

  return (
    <div
      onClick={() => {
        onSelect(isSelected ? null : item.id);
      }}
      className={`relative rounded-xl p-4 cursor-pointer transition-colors 
    ${
      isSelected
        ? "border border-secondary bg-secondary/10"
        : "border border-gray-300 bg-white"
    }`}
    >
      {/* notch RIGHT */}
      <span className="absolute -right-[15px] top-[51%] -translate-y-1/2 w-7 h-7 bg-white rounded-full z-30"></span>
      <span
        className={`absolute -right-[15px] top-[51%] -translate-y-1/2 w-7 h-7 rounded-full border z-40 [clip-path:inset(0_50%_0_0)]
                    ${
                      isSelected
                        ? "border border-secondary"
                        : "border border-gray-300"
                    }`}
      ></span>

      {/* notch LEFT */}
      <span className="absolute -left-[15px] top-[51%] -translate-y-1/2 w-7 h-7 bg-white rounded-full z-30"></span>
      <span
        className={`absolute -left-[15px] top-[51%] -translate-y-1/2 w-7 h-7 rounded-full border border-gray-300 z-40 [clip-path:inset(0_0_0_50%)]
                    ${
                      isSelected
                        ? "border border-secondary"
                        : "border border-gray-300"
                    }`}
      ></span>

      {/* dashed line */}
      <div className="absolute top-1/2 w-full border-t border-dashed border-gray-200"></div>

      {/* content */}
      <div className="grid grid-cols-2 gap-4 items-center mb-8">
        <div className="text-center text-xs text-wrap">{item.name}</div>
        <div className="text-center text-xs">
          {t(`${item.type}_discount`)} <br />
          <span className="font-bold">
            {t("off")}{" "}
            {item.discount_type === "fixed"
              ? `${item.discount_value.toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} €`
              : `${item.discount_value}%`}
          </span>
        </div>
      </div>

      {/* footer */}
      <div className="flex justify-between items-center">
        <Button
          type="button"
          className="bg-black text-white hover:bg-secondary text-xs px-3 py-1 rounded-full"
        >
          {isLoadingVoucher ? (
            <Loader2 className="animate-spin" />
          ) : (
            t("applyCode")
          )}
        </Button>
        <span className="font-bold text-xs">{item.code}</span>
      </div>
    </div>
  );
};

export default ProductVoucher;
