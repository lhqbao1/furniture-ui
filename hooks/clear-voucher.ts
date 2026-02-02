"use client";

import { usePathname } from "@/src/i18n/navigation";
import { useEffect } from "react";

const CLEAR_PATHS = ["check-out", "thank-you"];

export const useClearVoucherOnLeave = () => {
  const pathname = usePathname();

  useEffect(() => {
    // cleanup sẽ chạy khi rời khỏi page hiện tại
    return () => {
      const shouldClear = CLEAR_PATHS.some((p) => pathname.includes(p));

      if (shouldClear) {
        localStorage.removeItem("voucherId");
      }
    };
  }, [pathname]);
};
