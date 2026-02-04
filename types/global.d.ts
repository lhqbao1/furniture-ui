export {};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (
      command: "config" | "event" | "js" | string,
      targetIdOrEventName?: string | Date,
      params?: Record<string, any>,
    ) => void;
  }
}
