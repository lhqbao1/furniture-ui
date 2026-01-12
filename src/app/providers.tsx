"use client";

import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const recover = (e: any) => {
      const msg = e?.reason?.message || e?.message || "";
      if (msg.includes("ChunkLoadError") || msg.includes("Loading chunk")) {
        location.reload();
      }
    };

    window.addEventListener("unhandledrejection", recover);
    window.addEventListener("error", recover);

    return () => {
      window.removeEventListener("unhandledrejection", recover);
      window.removeEventListener("error", recover);
    };
  }, []);

  return <>{children}</>;
}
