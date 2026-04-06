"use client";

import React from "react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import DynamicTMTracker from "./dynamic-tm-tracker";

const EXCLUDED_PATH_PATTERNS = [
  /^\/[^/]+\/?$/,
  /^\/[^/]+\/category(\/|$)/,
  /^\/[^/]+\/product(\/|$)/,
  /^\/[^/]+\/shop-all(\/|$)/,
  /^\/[^/]+\/shop(\/|$)/,
  /^\/[^/]+\/cart(\/|$)/,
  /^\/[^/]+\/thank-you(\/|$)/,
  /^\/[^/]+\/(admin|auth|dsp)(\/|$)/,
];

export default function DynamicOtherTracker() {
  const pathname = usePathname();
  const locale = useLocale();

  const shouldTrackOther = React.useMemo(() => {
    if (!pathname) return false;
    return !EXCLUDED_PATH_PATTERNS.some((pattern) => pattern.test(pathname));
  }, [pathname]);

  if (!shouldTrackOther) return null;

  return (
    <DynamicTMTracker
      enabled
      eventId={`other:${pathname}`}
      payload={{
        type: "other",
        country: locale.toUpperCase(),
      }}
    />
  );
}
