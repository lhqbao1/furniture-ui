"use client";

import React from "react";

type PayloadValue = string | number | boolean | null | undefined;
type DynamicTmPayload = Record<string, PayloadValue>;

type DynamicTrackingWindow = Window & {
  dynamic_tm_data?: Record<string, string>;
};

type DynamicTMTrackerProps = {
  payload: DynamicTmPayload;
  enabled?: boolean;
  eventId?: string;
};

const normalizeTrackingDomain = (domain?: string | null) =>
  (domain ?? "")
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");

const normalizePayload = (payload: DynamicTmPayload): Record<string, string> =>
  Object.entries(payload).reduce<Record<string, string>>((acc, [key, value]) => {
    if (value === undefined || value === null) return acc;

    const normalized = String(value).trim();
    if (!normalized) return acc;

    acc[key] = normalized;
    return acc;
  }, {});

const hashString = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

export default function DynamicTMTracker({
  payload,
  enabled = true,
  eventId,
}: DynamicTMTrackerProps) {
  const trackingDomain = normalizeTrackingDomain(
    process.env.NEXT_PUBLIC_DYNAMIC_TRACKING_DOMAIN,
  );
  const trackingCode =
    process.env.NEXT_PUBLIC_DYNAMIC_TRACKING_CODE?.trim() ?? "";

  const normalizedPayload = React.useMemo(
    () => normalizePayload(payload),
    [payload],
  );

  const trackingKey = React.useMemo(() => {
    const base = eventId || JSON.stringify(normalizedPayload);
    return hashString(base);
  }, [eventId, normalizedPayload]);

  React.useEffect(() => {
    if (!enabled) return;
    if (!trackingDomain || !trackingCode) return;
    if (!normalizedPayload.type) return;

    const storageKey = `dynamic_tm_sent_${trackingKey}`;
    if (sessionStorage.getItem(storageKey)) return;

    const trackingWindow = window as DynamicTrackingWindow;
    trackingWindow.dynamic_tm_data = normalizedPayload;

    const script = document.createElement("script");
    script.id = `dynamic_tm_script_${trackingKey}`;
    script.type = "text/javascript";
    script.async = true;
    script.src =
      `https://${trackingDomain}/tm_js.aspx?` +
      `trackid=${encodeURIComponent(trackingCode)}` +
      `&mode=2&dt_freetext=&dt_subid1=&dt_subid2=&dt_keywords=`;

    document.body.appendChild(script);
    sessionStorage.setItem(storageKey, "1");
  }, [
    enabled,
    normalizedPayload,
    trackingCode,
    trackingDomain,
    trackingKey,
  ]);

  return null;
}
