"use client";
import { useEffect } from "react";

export function BilligerSoluteLanding() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("soluteclid");
    if (!id) return;

    const payload = `${Date.now()} ${window.location.href}`;
    localStorage.setItem("soluteclid", payload);
  }, []);

  return null;
}
