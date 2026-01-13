"use client";

import { useCheckAppVersion } from "@/hooks/useCheckVersion";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  useCheckAppVersion();

  useEffect(() => {
    const handler = (e: any) => {
      const pathname = window.location.pathname;

      // ❗ guard checkout / thank-you
      if (
        pathname.startsWith("/check-out") ||
        pathname.startsWith("/thank-you")
      ) {
        return;
      }

      const msg = e?.reason?.message || e?.message || "";

      if (
        msg.includes("ChunkLoadError") ||
        msg.includes("Loading chunk") ||
        msg.includes("missing chunk") ||
        msg.includes("Failed to fetch dynamically imported module")
      ) {
        const key = "chunk-reloaded";
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1");
          window.location.reload();
        }
      }
    };

    window.addEventListener("error", handler);
    window.addEventListener("unhandledrejection", handler);

    return () => {
      window.removeEventListener("error", handler);
      window.removeEventListener("unhandledrejection", handler);
    };
  }, []);

  return children as any;
}
