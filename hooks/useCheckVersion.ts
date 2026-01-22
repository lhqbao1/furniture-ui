"use client";

import { useEffect } from "react";

export function useCheckAppVersion() {
  if (process.env.NODE_ENV === "development") return;

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // guard pages
        const pathname = window.location.pathname;
        if (
          pathname.includes("/check-out") ||
          pathname.includes("/thank-you") ||
          pathname.includes("/login") ||
          pathname.includes("/sign-up")
        ) {
          return;
        }

        if (document.hidden || !navigator.onLine) {
          return;
        }

        const res = await fetch("/version.json", { cache: "no-cache" });
        const data = await res.json();

        // @ts-ignore
        if (data.version !== window.__APP_VERSION__) {
          window.location.reload();
        }
      } catch (err) {
        console.warn("Failed to check version:", err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);
}
