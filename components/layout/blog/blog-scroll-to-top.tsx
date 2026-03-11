"use client";

import { useEffect } from "react";
import { usePathname } from "@/src/i18n/navigation";

export default function BlogScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}
