"use client";

import { useEffect } from "react";

export function AwinTracker() {
  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const utm = search.get("utm_source");
    const awc = search.get("awc");

    if (utm !== "awin" || !awc) return;

    // TTL store
    const ttl = 1000 * 60 * 60 * 24 * 30;
    localStorage.setItem("awc_awin", `${Date.now()} ${awc}`);

    // prevent double fire
    if (sessionStorage.getItem("awin_track_sent")) return;

    fetch("/awin/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ awc }),
    }).finally(() => {
      sessionStorage.setItem("awin_track_sent", "1");
    });
  }, []);

  return null;
}
