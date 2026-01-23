"use client";

import { useEffect } from "react";

export function AwinLanding() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // chống load lại
    if ((window as any).__awinLandingLoaded) return;
    (window as any).__awinLandingLoaded = true;

    const script = document.createElement("script");
    script.src = "https://www.dwin1.com/121738.js";
    script.async = true;

    const run = () => {
      // 🔥 ĐƯA SCRIPT LÊN ĐẦU BODY
      document.body.prepend(script);
    };

    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(run);
    } else {
      setTimeout(run, 0);
    }
  }, []);

  return null;
}
