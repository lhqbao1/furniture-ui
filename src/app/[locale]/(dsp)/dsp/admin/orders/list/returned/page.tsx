import DSPOrderListPage from "../_components/dsp-order-list-page";

const RETURNED_STATUSES = ["return", "return_issue"];

export default function DSPReturnedOrdersPage() {
  return <DSPOrderListPage statuses={RETURNED_STATUSES} title="Returned Orders" />;
}
