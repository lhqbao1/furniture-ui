"use client";

import { trackAwin } from "@/features/checkout/api";
import { useEffect } from "react";

export function AwinTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const search = new URLSearchParams(window.location.search);
    const utm = search.get("utm_source");
    const awc = search.get("awc");

    if (utm !== "awin" || !awc) return;

    const ttl = 1000 * 60 * 60 * 24 * 30;
    const stored = localStorage.getItem("awc_awin");

    let shouldTrack = false;

    if (stored) {
      const [timestamp, prevAwc] = stored.split(" ", 2);

      // TTL check
      const valid = +timestamp + ttl > Date.now();

      // nếu awc mới khác → override
      if (!valid || prevAwc !== awc) {
        shouldTrack = true;
      }
    } else {
      shouldTrack = true;
    }

    if (!shouldTrack) return;

    // update storage
    localStorage.setItem("awc_awin", `${Date.now()} ${awc}`);

    trackAwin(awc).catch(console.error);
  }, []);

  return null;
}
