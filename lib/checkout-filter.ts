import { CartItem } from "@/types/cart";
import { CheckOutMain } from "@/types/checkout";

type CheckoutChild = CheckOutMain["checkouts"][number];

export const EXCLUDED_EXCHANGE_CHECKOUT_STATUSES = new Set([
  "exchange",
  "cancel_exchange",
  "exchange_stock_reserved",
  "exchange_shipped",
  "exchange_preparation_shipping",
  "exchange_cancel_no_stock",
]);

export function isExcludedExchangeCheckoutStatus(status?: string | null) {
  return EXCLUDED_EXCHANGE_CHECKOUT_STATUSES.has(
    status?.toLowerCase().trim() ?? "",
  );
}

export function filterInvoiceCheckouts(
  checkouts?: CheckoutChild[] | null,
): CheckoutChild[] {
  return (checkouts ?? []).filter(
    (checkout) => !isExcludedExchangeCheckoutStatus(checkout.status),
  );
}

export function filterMainCheckoutForInvoice(
  checkoutMain?: CheckOutMain | null,
): CheckOutMain | undefined {
  if (!checkoutMain) return undefined;

  const filteredCheckouts = filterInvoiceCheckouts(checkoutMain.checkouts);

  return {
    ...checkoutMain,
    checkouts: filteredCheckouts,
  };
}

export function extractInvoiceCartItemsFromMain(
  checkoutMain?: CheckOutMain | null,
): CartItem[] {
  return filterInvoiceCheckouts(checkoutMain?.checkouts).flatMap((checkout) => {
    if (Array.isArray(checkout.cart)) {
      return checkout.cart.flatMap((cartItem) => cartItem.items ?? []);
    }

    return checkout.cart?.items ?? [];
  });
}
