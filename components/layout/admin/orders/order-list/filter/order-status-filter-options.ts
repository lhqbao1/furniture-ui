export type OrderListStatusFilterOption = {
  key: string;
  label: string;
  statuses?: string[];
};

// Dedicated options for Order List toolbar filter only.
// Do NOT reuse STATUS_OPTIONS because business needs grouped display/filter here.
export const ORDER_LIST_STATUS_FILTER_OPTIONS: OrderListStatusFilterOption[] = [
  {
    key: "pending",
    label: "Waiting for payment",
  },
  {
    key: "paid",
    label: "Payment received",
  },
  {
    key: "preparing",
    label: "Preparing",
    statuses: ["preparation_shipping", "ds_informed"],
  },
  {
    key: "stock_reserved",
    label: "Stock reserved",
    statuses: ["tock_reserved", "reserved", "stock_reserved"],
  },
  {
    key: "dispatched",
    label: "Dispatched",
    statuses: ["shipped", "completed", "dispatched"],
  },
  {
    key: "canceled",
    label: "Canceled",
    statuses: ["canceled", "canceled_wrong_price", "canceled_no_stock"],
  },
  {
    key: "returned",
    label: "Returned",
    statuses: [
      "return",
      "waiting_for_return",
      "items_are_checked",
      "warranty_initiated",
      "exchange_initiated",
      "credit_note_created",
    ],
  },
  {
    key: "refund",
    label: "Refund",
    statuses: ["return_issue"],
  },
];

