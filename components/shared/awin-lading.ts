"use client";

import { useEffect } from "react";

export function AwinLanding() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.__awinLandingLoaded) return;
    window.__awinLandingLoaded = true;

    const script = document.createElement("script");
    script.src = "https://www.dwin1.com/121738.js";
    script.async = true;

    const run = () => document.body.appendChild(script);

    if ("requestIdleCallback" in window) requestIdleCallback(run);
    else setTimeout(run, 500);
  }, []);

  return null;
}
