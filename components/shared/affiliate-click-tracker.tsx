"use client";

import { useTrackAffiliateClick } from "@/features/affiliate/hook";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

const PRODUCT_DETAIL_PATH_REGEX = /^\/(?:[a-z]{2}\/)?product\/.+/i;
const WINDOW_TRACKED_KEYS = "__ph_affiliate_click_tracked_keys__";

function resolveLandingPage(pathname: string | null): string | null {
  if (!pathname) return null;

  const normalizedPath = pathname.replace(/\/+$/, "");
  const withLeadingSlash = normalizedPath.startsWith("/")
    ? normalizedPath
    : `/${normalizedPath}`;

  if (!PRODUCT_DETAIL_PATH_REGEX.test(withLeadingSlash)) return null;

  const withoutLocale = withLeadingSlash.replace(/^\/[a-z]{2}(?=\/)/i, "");
  return withoutLocale.startsWith("/product/") ? withoutLocale : null;
}

declare global {
  interface Window {
    [WINDOW_TRACKED_KEYS]?: Set<string>;
  }
}

function getRuntimeTrackedKeys() {
  if (typeof window === "undefined") return new Set<string>();
  if (!window[WINDOW_TRACKED_KEYS]) {
    window[WINDOW_TRACKED_KEYS] = new Set<string>();
  }
  return window[WINDOW_TRACKED_KEYS]!;
}

export function AffiliateClickTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { mutate } = useTrackAffiliateClick();
  const landingPage = useMemo(() => resolveLandingPage(pathname), [pathname]);
  const search = searchParams.toString();

  useEffect(() => {
    if (!landingPage) return;

    const params = new URLSearchParams(search);
    const utmSource = params.get("utm_source")?.trim();
    const aff = params.get("aff")?.trim();

    if (!utmSource || !aff) return;

    const trackedKey = `${landingPage}|${utmSource}|${aff}`;
    const trackedKeys = getRuntimeTrackedKeys();
    if (trackedKeys.has(trackedKey)) return;

    trackedKeys.add(trackedKey);

    mutate(
      {
        aff,
        utm_source: utmSource,
        landing_page: landingPage,
      },
      {
        onError: () => {
          trackedKeys.delete(trackedKey);
        },
      },
    );
  }, [landingPage, mutate, search]);

  return null;
}
