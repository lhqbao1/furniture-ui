"use client";

import { useEffect } from "react";

export function useCheckAppVersion() {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // guard pages
        const pathname = window.location.pathname;
        if (
          pathname.startsWith("/checkout") ||
          pathname.startsWith("/order/thank-you")
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
          console.log("New version detected → reloading app...");
          window.location.reload();
        }
      } catch (err) {
        console.warn("Failed to check version:", err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);
}
