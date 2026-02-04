"use client";
import { useEffect } from "react";

export function useAwinAttribution() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.gtag) return;

    const params = new URLSearchParams(window.location.search);
    const awc = params.get("awc");
    const utmSource = params.get("utm_source");
    const utmMedium = params.get("utm_medium");

    if (awc && utmSource === "awin" && !utmMedium) {
      window.gtag("event", "page_view", {
        source: "awin",
        medium: "affiliate",
        campaign: "awin",
      });
    }
  }, []);
}
