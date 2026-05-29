"use client";

import { useTrackAffiliatePageView } from "@/features/affiliate/hook";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";

const TRACKED_PAGE_PATTERNS = [
  /^\/$/,
  /^\/cart(\/|$)/,
  /^\/check-out(\/|$)/,
  /^\/blog(\/|$)/,
  /^\/shop-all(\/|$)/,
  /^\/category(\/|$)/,
  /^\/product(\/|$)/,
];

const LOCALE_PREFIX_REGEX = /^\/[a-z]{2}(?=\/|$)/i;

type ActivePageSession = {
  url: string;
  visibleMs: number;
  visibleStartedAt: number | null;
};

function normalizeTrackablePath(pathname: string | null): string | null {
  if (!pathname) return null;

  const trimmed = pathname.replace(/\/+$/, "");
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const withoutLocale = withLeadingSlash.replace(LOCALE_PREFIX_REGEX, "") || "/";
  const normalized = withoutLocale || "/";

  return TRACKED_PAGE_PATTERNS.some((pattern) => pattern.test(normalized))
    ? normalized
    : null;
}

function calcTimeSpentSeconds(session: ActivePageSession, now: number) {
  const visibleMs =
    session.visibleMs +
    (session.visibleStartedAt ? now - session.visibleStartedAt : 0);

  if (visibleMs <= 0) return 0;
  return Math.max(1, Math.round(visibleMs / 1000));
}

function hasSessionIdCookie() {
  if (typeof document === "undefined") return false;

  return document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .some((cookie) => cookie.startsWith("session_id=") && cookie.length > 11);
}

function canInspectSessionCookieInClient() {
  if (typeof window === "undefined") return false;

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!apiBaseUrl) return true;

  try {
    const apiOrigin = new URL(apiBaseUrl, window.location.origin).origin;
    return apiOrigin === window.location.origin;
  } catch {
    return true;
  }
}

function shouldTrackBySessionCookie() {
  if (hasSessionIdCookie()) return true;

  // Fallback: when API is cross-origin or session cookie is HttpOnly,
  // browser JS cannot reliably read `session_id`. Let backend validate cookie.
  return !canInspectSessionCookieInClient();
}

export function AffiliatePageViewTracker() {
  const pathname = usePathname();
  const { mutate } = useTrackAffiliatePageView();
  const sessionRef = useRef<ActivePageSession | null>(null);
  const trackedPath = useMemo(() => normalizeTrackablePath(pathname), [pathname]);

  const sendPageView = useCallback(
    (url: string, timeSpent: number) => {
      if (!shouldTrackBySessionCookie()) return;

      mutate({
        url,
        time_spent: timeSpent,
      });
    },
    [mutate],
  );

  const flushSession = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;

    const now = Date.now();
    const timeSpent = calcTimeSpentSeconds(session, now);
    sessionRef.current = null;

    if (timeSpent <= 0) return;

    sendPageView(session.url, timeSpent);
  }, [sendPageView]);

  const startSession = useCallback((url: string) => {
    const now = Date.now();

    sessionRef.current = {
      url,
      visibleMs: 0,
      visibleStartedAt: document.visibilityState === "visible" ? now : null,
    };
  }, []);

  const handleVisibilityChange = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;

    const now = Date.now();

    if (document.visibilityState === "hidden") {
      if (session.visibleStartedAt) {
        session.visibleMs += now - session.visibleStartedAt;
        session.visibleStartedAt = null;
      }
      return;
    }

    if (!session.visibleStartedAt) {
      session.visibleStartedAt = now;
    }
  }, []);

  useEffect(() => {
    const currentSession = sessionRef.current;

    if (currentSession?.url === trackedPath) return;

    flushSession();

    if (trackedPath) {
      startSession(trackedPath);
    }
  }, [flushSession, startSession, trackedPath]);

  useEffect(() => {
    const onPageHide = () => {
      flushSession();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [flushSession, handleVisibilityChange]);

  return null;
}
