import DSPOrderListPage from "../_components/dsp-order-list-page";

const PREPARING_STATUSES = ["preparation_shipping"];

export default function DSPPreparingOrdersPage() {
  return (
    <DSPOrderListPage statuses={PREPARING_STATUSES} title="Preparing Orders" />
  );
}
