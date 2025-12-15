import { useTranslations } from "next-intl";

export function useVoucherTypeOptions() {
  const t = useTranslations("voucher.type");

  return [
    { value: "product", label: t("product_discount") },
    { value: "order", label: t("order_discount") },
    { value: "user_specific", label: t("user_discount") },
    { value: "shipping", label: t("shipping_discount") },
  ];
}
