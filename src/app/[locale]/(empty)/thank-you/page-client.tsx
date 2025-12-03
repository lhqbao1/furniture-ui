"use client";
import { useRouter } from "@/src/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import OrderPlaced from "./container";
import { Loader2 } from "lucide-react";
import { useLocale } from "next-intl";

const OrderPlacedWrapper = () => {
  const router = useRouter();
  const locale = useLocale();
  const params = useSearchParams();
  const status = params?.get("redirect_status");
  const [counter, setCounter] = useState(5);

  useEffect(() => {
    if (status === "failed" && counter === 4) {
      router.replace("/check-out", { locale });

      // Luôn xóa checkout + payment ID
      localStorage.removeItem("checkoutId");
      localStorage.removeItem("paymentId");

      // Chỉ xóa token nếu có userIdGuest
      const guestId = localStorage.getItem("userIdGuest");
      if (guestId) {
        localStorage.removeItem("userIdGuest");
        localStorage.removeItem("access_token");
      }
    }

    const timer = setTimeout(() => setCounter((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [counter, status]);

  if (status === "failed") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 w-full">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return <OrderPlaced />;
};

export default OrderPlacedWrapper;
