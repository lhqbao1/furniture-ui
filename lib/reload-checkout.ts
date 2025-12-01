// src/lib/preload-checkout.ts
export const preloadCheckout = () => {
  // Chỉ preload nếu chưa preload trước đó
  if (typeof window === "undefined") return;
  if ((window as any).__checkout_preloaded) return;

  (window as any).__checkout_preloaded = true;

  Promise.all([
    import("@/components/layout/checkout/user-information"),
    import("@/components/layout/checkout/shipping-address"),
    import("@/components/layout/checkout/invoice-address"),
    import("@/components/shared/stripe/stripe"),
  ]);
};
