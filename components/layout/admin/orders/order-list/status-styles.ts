// status-style.ts
export function getStatusStyle(raw: string) {
  const key = raw.toLowerCase();

  switch (key) {
    case "pending":
      return {
        text: "waiting for payment",
        bg: "bg-[#f3e8ff]",
        color: "text-[#9b59ff]",
      };

    case "tock_reserved":
      return {
        text: "stock reserved",
        bg: "bg-[#ffe4e9]",
        color: "text-[#ff4f7b]",
      };
    case "reserved":
      return { text: "reserved", bg: "bg-[#ffe4e9]", color: "text-[#ff4f7b]" };

    case "preparation_shipping":
      return {
        text: "preparing",
        bg: "bg-[#D4EEF9]",
        color: "text-[#29ABE2]",
      };

    case "ds_informed":
      return {
        text: "DS informed",
        bg: "bg-[#dbeafe]",
        color: "text-[#3182ce]",
      };

    case "paid":
      return {
        text: "Payment received",
        bg: "bg-[#FFF6CC]",
        color: "text-[#FED000]",
      };

    case "shipped":
      return {
        text: "dispatched",
        bg: "bg-[#dcfce7]",
        color: "text-[#22c55e]",
      };

    case "completed":
      return {
        text: "dispatched",
        bg: "bg-[#dcfce7]",
        color: "text-[#39B54A]",
      };

    case "cancel_request":
      return {
        text: "requested to cancel",
        bg: "bg-[#fee2e2]",
        color: "text-[#dc2626]",
      };

    case "items_are_checked":
      return {
        text: "Items are checked",
        bg: "bg-[#fee2e2]",
        color: "text-[#dc2626]",
      };

    case "waiting_for_return":
      return {
        text: "Waiting for return",
        bg: "bg-[#fee2e2]",
        color: "text-[#dc2626]",
      };

    case "warranty_initiated":
      return {
        text: "Warranty Initiated",
        bg: "bg-[#fee2e2]",
        color: "text-[#dc2626]",
      };

    case "exchange_initiated":
      return {
        text: "Exchange Initiated",
        bg: "bg-[#fee2e2]",
        color: "text-[#dc2626]",
      };

    case "credit_note_created":
      return {
        text: "Credit note created",
        bg: "bg-[#fee2e2]",
        color: "text-[#dc2626]",
      };

    case "canceled_no_stock":
      return {
        text: "Canceled no stock",
        bg: "bg-[#FFD2D3]",
        color: "text-[#FF0000]",
      };

    case "canceled_wrong_price":
      return {
        text: "Canceled wrong price",
        bg: "bg-[#FFD2D3]",
        color: "text-[#FF0000]",
      };

    case "canceled":
      return { text: "canceled", bg: "bg-[#FFD2D3]", color: "text-[#FF0000]" };

    case "return":
      return {
        text: "returned",
        bg: "bg-[#FDE9D2]",
        color: "text-[#F7931E]",
      };

    case "return_issue":
      return {
        text: "Issue Refund",
        bg: "bg-[#FDE9D2]",
        color: "text-[#F7931E]",
      };

    default:
      return { text: key, bg: "bg-gray-200", color: "text-gray-700" };
  }
}

export function getStatusStyleDe(raw: string) {
  const key = raw.toLowerCase();
  const cancelStatus = {
    text: "Storniert",
    bg: "bg-[#FFD2D3]",
    color: "text-[#FF0000]",
  };

  if (key.includes("cancel")) {
    return cancelStatus;
  }

  switch (key) {
    case "pending":
      return {
        text: "Warten auf Zahlung",
        bg: "bg-[#f3e8ff]",
        color: "text-[#9b59ff]",
      };

    case "tock_reserved":
      return {
        text: "Wird vorbereitet",
        bg: "bg-[#ffe4e9]",
        color: "text-[#ff4f7b]",
      };
    case "reserved":
      return {
        text: "Wird vorbereitet",
        bg: "bg-[#ffe4e9]",
        color: "text-[#ff4f7b]",
      };

    case "preparation_shipping":
      return {
        text: "Wird vorbereitet",
        bg: "bg-[#D4EEF9]",
        color: "text-[#29ABE2]",
      };

    case "ds_informed":
      return {
        text: "DS informiert",
        bg: "bg-[#dbeafe]",
        color: "text-[#3182ce]",
      };

    case "paid":
      return {
        text: "Zahlung eingegangen",
        bg: "bg-[#FFF6CC]",
        color: "text-[#FED000]",
      };

    case "shipped":
      return {
        text: "Zugestellt",
        bg: "bg-[#dcfce7]",
        color: "text-[#22c55e]",
      };

    case "completed":
      return {
        text: "Versendet",
        bg: "bg-[#dcfce7]",
        color: "text-[#39B54A]",
      };

    case "items_are_checked":
      return {
        text: "Artikel geprüft",
        bg: "bg-[#fee2e2]",
        color: "text-[#dc2626]",
      };

    case "waiting_for_return":
      return {
        text: "Warten auf Rücksendung",
        bg: "bg-[#fee2e2]",
        color: "text-[#dc2626]",
      };

    case "warranty_initiated":
      return {
        text: "Garantie gestartet",
        bg: "bg-[#fee2e2]",
        color: "text-[#dc2626]",
      };

    case "exchange_initiated":
      return {
        text: "Umtausch gestartet",
        bg: "bg-[#fee2e2]",
        color: "text-[#dc2626]",
      };

    case "credit_note_created":
      return {
        text: "Gutschrift erstellt",
        bg: "bg-[#fee2e2]",
        color: "text-[#dc2626]",
      };

    case "return":
      return {
        text: "Zurückgesendet",
        bg: "bg-[#FDE9D2]",
        color: "text-[#F7931E]",
      };
    case "return_issue":
      return {
        text: "Rückerstattung veranlassen",
        bg: "bg-[#FDE9D2]",
        color: "text-[#F7931E]",
      };

    default:
      return { text: key, bg: "bg-gray-200", color: "text-gray-700" };
  }
}

export function getShippingStatusStyle(raw: string) {
  const key = raw.toLowerCase();

  switch (key) {
    case "pending":
      return {
        text: "waiting for payment",
        bg: "bg-[#f3e8ff]",
        color: "text-[#9b59ff]",
      };

    case "tock_reserved":
      return {
        text: "stock reserved",
        bg: "bg-[#ffe4e9]",
        color: "text-[#ff4f7b]",
      };
    case "reserved":
      return { text: "reserved", bg: "bg-[#ffe4e9]", color: "text-[#ff4f7b]" };

    case "preparation_shipping":
      return {
        text: "preparing",
        bg: "bg-[#D4EEF9]",
        color: "text-[#29ABE2]",
      };

    case "ds_informed":
      return {
        text: "DS informed",
        bg: "bg-[#dbeafe]",
        color: "text-[#3182ce]",
      };

    case "paid":
      return {
        text: "Payment received",
        bg: "bg-[#FFF6CC]",
        color: "text-[#FED000]",
      };

    case "shipped":
      return {
        text: "dispatched",
        bg: "bg-[#dcfce7]",
        color: "text-[#22c55e]",
      };

    case "completed":
      return {
        text: "dispatched",
        bg: "bg-[#dcfce7]",
        color: "text-[#39B54A]",
      };

    case "cancel_request":
      return {
        text: "requested to cancel",
        bg: "bg-[#fee2e2]",
        color: "text-[#dc2626]",
      };

    case "items_are_checked":
      return {
        text: "Items are checked",
        bg: "bg-[#fee2e2]",
        color: "text-[#dc2626]",
      };

    case "waiting_for_return":
      return {
        text: "Waiting for return",
        bg: "bg-[#fee2e2]",
        color: "text-[#dc2626]",
      };

    case "warranty_initiated":
      return {
        text: "Warranty Initiated",
        bg: "bg-[#fee2e2]",
        color: "text-[#dc2626]",
      };

    case "exchange_initiated":
      return {
        text: "Exchange Initiated",
        bg: "bg-[#fee2e2]",
        color: "text-[#dc2626]",
      };

    case "credit_note_created":
      return {
        text: "Credit note created",
        bg: "bg-[#fee2e2]",
        color: "text-[#dc2626]",
      };

    case "canceled_no_stock":
      return {
        text: "Canceled no stock",
        bg: "bg-[#FFD2D3]",
        color: "text-[#FF0000]",
      };

    case "canceled_wrong_price":
      return {
        text: "Canceled wrong price",
        bg: "bg-[#FFD2D3]",
        color: "text-[#FF0000]",
      };

    case "canceled":
      return { text: "canceled", bg: "bg-[#FFD2D3]", color: "text-[#FF0000]" };

    case "return":
      return {
        text: "returned",
        bg: "bg-[#FDE9D2]",
        color: "text-[#F7931E]",
      };

    case "return_issue":
      return {
        text: "Issue Refund",
        bg: "bg-[#FDE9D2]",
        color: "text-[#F7931E]",
      };

    default:
      return { text: key, bg: "bg-gray-200", color: "text-gray-700" };
  }
}
