import DSPOrderListPage from "../_components/dsp-order-list-page";

const DISPATCHED_STATUSES = ["shipped", "completed"];

export default function DSPDispatchedOrdersPage() {
  return (
    <DSPOrderListPage
      statuses={DISPATCHED_STATUSES}
      title="Dispatched Orders"
    />
  );
}
