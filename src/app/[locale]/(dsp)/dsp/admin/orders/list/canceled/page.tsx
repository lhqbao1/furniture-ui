import DSPOrderListPage from "../_components/dsp-order-list-page";

const CANCELED_STATUSES = [
  "cancel_request",
  "canceled",
  "canceled_no_stock",
  "canceled_wrong_price",
];

export default function DSPCanceledOrdersPage() {
  return (
    <DSPOrderListPage statuses={CANCELED_STATUSES} title="Canceled Orders" />
  );
}
