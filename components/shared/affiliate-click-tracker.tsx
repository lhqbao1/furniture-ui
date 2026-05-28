"use client";

import { useTrackAffiliateClick } from "@/features/affiliate/hook";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

const TRACKED_AFFILIATE_CLICK_KEY = "tracked_affiliate_click_keys";
const PRODUCT_DETAIL_PATH_REGEX = /^\/(?:[a-z]{2}\/)?product\/.+/i;

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

function readTrackedKeys() {
  if (typeof window === "undefined") return new Set<string>();

  const raw = window.sessionStorage.getItem(TRACKED_AFFILIATE_CLICK_KEY);
  if (!raw) return new Set<string>();

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set<string>();

    return new Set(
      parsed.filter((value): value is string => typeof value === "string"),
    );
  } catch {
    return new Set<string>();
  }
}

function hasTrackedKey(key: string) {
  return readTrackedKeys().has(key);
}

function addTrackedKey(key: string) {
  if (typeof window === "undefined") return;

  const keys = readTrackedKeys();
  keys.add(key);
  window.sessionStorage.setItem(
    TRACKED_AFFILIATE_CLICK_KEY,
    JSON.stringify(Array.from(keys)),
  );
}

function removeTrackedKey(key: string) {
  if (typeof window === "undefined") return;

  const keys = readTrackedKeys();
  keys.delete(key);
  window.sessionStorage.setItem(
    TRACKED_AFFILIATE_CLICK_KEY,
    JSON.stringify(Array.from(keys)),
  );
}

export function AffiliateClickTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { mutate } = useTrackAffiliateClick();
  const trackedInMemoryRef = useRef<Set<string>>(new Set());
  const landingPage = useMemo(() => resolveLandingPage(pathname), [pathname]);
  const search = searchParams.toString();

  useEffect(() => {
    if (!landingPage) return;

    const params = new URLSearchParams(search);
    const utmSource = params.get("utm_source")?.trim();
    const aff = params.get("aff")?.trim();

    if (!utmSource || !aff) return;

    const trackedKey = `${landingPage}|${utmSource}|${aff}`;
    if (trackedInMemoryRef.current.has(trackedKey) || hasTrackedKey(trackedKey))
      return;

    trackedInMemoryRef.current.add(trackedKey);
    addTrackedKey(trackedKey);

    mutate(
      {
        aff,
        utm_source: utmSource,
        landing_page: landingPage,
      },
      {
        onError: () => {
          trackedInMemoryRef.current.delete(trackedKey);
          removeTrackedKey(trackedKey);
        },
      },
    );
  }, [landingPage, mutate, search]);

  return null;
}
