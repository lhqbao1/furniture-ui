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
    case "reserved":
      return { text: "reserved", bg: "bg-[#ffe4e9]", color: "text-[#ff4f7b]" };

    case "preparation_shipping":
      return {
        text: "preparing to ship",
        bg: "bg-[#dbeafe]",
        color: "text-[#3182ce]",
      };

    case "ds_informed":
      return {
        text: "supplier informed",
        bg: "bg-[#dbeafe]",
        color: "text-[#3182ce]",
      };

    case "paid":
      return { text: "paid", bg: "bg-[#fef9c3]", color: "text-[#d97706]" };

    case "shipped":
      return { text: "shipped", bg: "bg-[#dcfce7]", color: "text-[#22c55e]" };

    case "completed":
      return { text: "completed", bg: "bg-[#dcfce7]", color: "text-[#39B54A]" };

    case "cancel_request":
      return {
        text: "requested to cancel",
        bg: "bg-[#fee2e2]",
        color: "text-[#dc2626]",
      };

    case "canceled":
      return { text: "canceled", bg: "bg-[#ffe4e6]", color: "text-[#e11d48]" };

    case "return":
      return { text: "returned", bg: "bg-[#fef9c3]", color: "text-[#d97706]" };

    default:
      return { text: key, bg: "bg-gray-200", color: "text-gray-700" };
  }
}
