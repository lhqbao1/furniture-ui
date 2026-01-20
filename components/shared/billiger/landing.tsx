"use client";
import { useEffect } from "react";

export function BilligerSoluteLanding() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("soluteclid");
    if (!id) return;

    // save click
    const payload = `${Date.now()} ${window.location.href}`;
    localStorage.setItem("soluteclid", payload);

    // notify solute / billiger
    const trackingUrl =
      "https://cmodul.solutenetwork.com/landing?url=" +
      encodeURIComponent(window.location.href);

    const req = new XMLHttpRequest();
    req.open("GET", trackingUrl);
    req.send();
  }, []);

  return null;
}
