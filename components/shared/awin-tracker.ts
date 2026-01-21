"use client";

import { trackAwin } from "@/features/checkout/api";
import { useEffect } from "react";

export function AwinTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return; // safety for SSR hydration

    const search = new URLSearchParams(window.location.search);
    const utm = search.get("utm_source");
    const awc = search.get("awc");

    if (utm !== "awin" || !awc) return;

    // TTL store for conversion stage
    const ttl = 1000 * 60 * 60 * 24 * 30;
    localStorage.setItem("awc_awin", `${Date.now()} ${awc}`);

    // prevent double fire
    if (sessionStorage.getItem("awin_track_sent")) return;

    trackAwin(awc)
      .catch((err) => {
        console.error("[AWIN TRACK ERROR]", err);
      })
      .finally(() => {
        sessionStorage.setItem("awin_track_sent", "1");
      });
  }, []);

  return null;
}
