"use client";
// components/TransactionCard.tsx
import { X, Check, Clock, AlertTriangle, Package, User2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useAtom } from "jotai";
import { currentVoucherAtom, lastVoucherAtom } from "@/store/voucher";

export type VoucherType = "shipping" | "user_specific" | "product" | "order";

interface TransactionCardProps {
  status: VoucherType;
  title: string;
  subtitle: string;
  footerText: string;
  highlightText: string;
  id: string;
}

const STATUS_CONFIG = {
  product: {
    icon: (
      <Package
        className="text-white"
        size={16}
      />
    ),
    badgeBg: "bg-secondary",
    cardBg: "bg-white",
    accentBg: "bg-green-50",
    textColor: "text-green-600",
  },
  user_specific: {
    icon: (
      <User2
        className="text-white"
        size={16}
      />
    ),
    badgeBg: "bg-blue-500",
    cardBg: "bg-white",
    accentBg: "bg-blue-50",
    textColor: "text-blue-600",
  },
  shipping: {
    icon: (
      <Clock
        className="text-white"
        size={16}
      />
    ),
    badgeBg: "bg-yellow-500",
    cardBg: "bg-white",
    accentBg: "bg-yellow-50",
    textColor: "text-yellow-600",
  },
  order: {
    icon: (
      <AlertTriangle
        className="text-white"
        size={16}
      />
    ),
    badgeBg: "bg-gray-500",
    cardBg: "bg-white",
    accentBg: "bg-gray-50",
    textColor: "text-gray-600",
  },
};

export default function TransactionCard({
  status,
  title,
  subtitle,
  footerText,
  highlightText,
  id,
}: TransactionCardProps) {
  const cfg = STATUS_CONFIG[status];
  const t = useTranslations();
  const [currentVoucher, setCurrentVoucher] = useAtom(currentVoucherAtom);
  const [lastVoucher, setLastVoucher] = useAtom(lastVoucherAtom);

  return (
    <div
      className={cn(
        "relative rounded-2xl shadow-lg border p-5 flex flex-col gap-4",
        cfg.cardBg,
      )}
    >
      {/* Badge */}
      {/* <div
        className={cn(
          "absolute -top-3 left-6 w-8 h-8 rounded-full flex items-center justify-center",
          cfg.badgeBg,
        )}
      >
        {currentVoucher === id ? (
          <Check
            className="text-white"
            size={16}
          />
        ) : (
          cfg.icon
        )}
      </div> */}
      <div
        className={cn(
          "absolute -top-3 left-6 w-8 h-8 rounded-full flex items-center justify-center",
          cfg.badgeBg,
        )}
      >
        <span
          className={cn(
            "absolute transition-all duration-200",
            currentVoucher === id
              ? "opacity-100 scale-100"
              : "opacity-0 scale-75",
          )}
        >
          <Check
            className="text-white"
            size={16}
          />
        </span>

        <span
          className={cn(
            "absolute transition-all duration-200",
            currentVoucher === id
              ? "opacity-0 scale-75"
              : "opacity-100 scale-100",
          )}
        >
          {cfg.icon}
        </span>
      </div>

      {/* Header */}
      <div className="mt-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground min-h-10 line-clamp-2">
          {subtitle}
        </p>
      </div>

      {/* Gift */}
      <div
        className={cn(
          "rounded-xl p-4 flex flex-col items-center gap-2",
          cfg.accentBg,
        )}
      >
        <Image
          src="/gift-box.png" // thay bằng asset của bạn
          alt="gift"
          width={80}
          height={80}
        />
        <p className={cn("font-semibold text-lg", cfg.textColor)}>
          {highlightText}
        </p>
      </div>

      <Button
        type="button"
        className="mt-4"
        variant={"secondary"}
        onClick={() => {
          setCurrentVoucher(id);
          setLastVoucher(null);
        }}
      >
        {t("exploreNow")}
      </Button>

      {/* Footer */}
      {/* <p className="text-sm text-muted-foreground text-center">{footerText}</p> */}
    </div>
  );
}
