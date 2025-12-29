"use client";

import { useEffect } from "react";

export default function RuntimeErrorLogger() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      console.error("🔥 Runtime JS error:", {
        message: event.message,
        stack: event.error?.stack,
        source: event.filename,
        line: event.lineno,
        col: event.colno,
      });
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("🔥 Unhandled promise rejection:", event.reason);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
