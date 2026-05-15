"use client";

import { useEffect, useMemo, useState } from "react";

type PostalCitySuggestionResponse = {
  postal_code: string;
  cities: string[];
};

export function usePostalCitySuggestions(postalCode?: string) {
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sanitizedPostalCode = useMemo(
    () => String(postalCode ?? "").replace(/\D/g, "").slice(0, 5),
    [postalCode],
  );

  useEffect(() => {
    if (!sanitizedPostalCode) {
      setCities([]);
      setIsLoading(false);
      return;
    }

    // Reset current result when postal code changes to avoid stale city list.
    setCities([]);
    setIsLoading(false);

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/postal-code/de?postal_code=${encodeURIComponent(sanitizedPostalCode)}`,
          {
            method: "GET",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          setCities([]);
          return;
        }

        const data = (await response.json()) as PostalCitySuggestionResponse;
        const list = Array.isArray(data?.cities) ? data.cities : [];
        setCities(Array.from(new Set(list.filter(Boolean))));
      } catch {
        if (controller.signal.aborted) return;
        setCities([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [sanitizedPostalCode]);

  return {
    cities,
    isLoading,
  };
}
