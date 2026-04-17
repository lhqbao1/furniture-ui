import React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import ReturnConfirmDialog from "./dialog/return-confirm-dialog";
import CancelConfirmDialog from "./dialog/canceled-confirm-dialog";
import { CheckOutMain } from "@/types/checkout";
import { STATUS_ACTIVE_RULES, STATUS_OPTIONS } from "@/data/data";
import PaidConfirmDialog from "./dialog/paid-comfirm-dialog";
import ExchangeConfirmDialog from "./dialog/exchange-confirm-dialog";
import CancelWrongPriceDialog from "./dialog/canceled-wrong-price-dialog";
import CancelNoStockConfirmDialog from "./dialog/canceled-no-stock-confirm-dialog";
import IssueRefundDialog from "./dialog/issue-refund-dialog";

const EMPTY_STATUS_VALUE = "__status_empty__";

const ORDER_STATUS_ACTION_LABELS: Record<string, string> = {
  paid: "Mark payment as received",
  canceled: "Cancel order",
  canceled_no_stock: "Cancel order (out of stock)",
  canceled_wrong_price: "Cancel order (wrong price)",
  return: "Mark as returned",
  return_issue: "Issue refund",
  exchange: "Start exchange",
  items_are_checked: "Mark items as checked",
  waiting_for_return: "Mark as waiting for return",
  warranty_initiated: "Start warranty process",
  exchange_initiated: "Start exchange process",
  credit_note_created: "Mark credit note as created",
  preparation_shipping: "Move to preparing",
  ds_informed: "Mark DS as informed",
  shipped: "Mark as shipped",
  completed: "Mark as delivered",
  tock_reserved: "Move to stock reserved",
};

const getOrderStatusActionLabel = (key: string, fallback: string) =>
  ORDER_STATUS_ACTION_LABELS[key] ?? fallback;

export const getStatusLabel = (status: string) => {
  const normalized = status.toLowerCase();

  const found = STATUS_OPTIONS.find((opt) => {
    // match trực tiếp theo key
    if (opt.key === normalized) return true;

    // match theo statuses (backend → ui)
    if (opt.statuses?.includes(normalized)) return true;

    return false;
  });

  return found ? found.label : status;
};

export default function OrderStatusSelector({
  status,
  order,
}: {
  status: string;
  order: CheckOutMain; // or CheckOutMain
}) {
  const [value, setValue] = React.useState<string>(EMPTY_STATUS_VALUE);
  const [openReturn, setOpenReturn] = React.useState(false);
  const [openIssueRefund, setOpenIssueRefund] = React.useState(false);

  const [openCancel, setOpenCancel] = React.useState(false);
  const [openPaid, setOpenPaid] = React.useState(false);
  const [openExchange, setOpenExchange] = React.useState(false);
  const [openCancelNoStock, setOpenCancelNoStock] = React.useState(false);
  const [openCancelWrongPrice, setOpenCancelWrongPrice] = React.useState(false);

  const options = React.useMemo(() => {
    const current = String(status).toLowerCase();
    const allowedKeys = new Set(STATUS_ACTIVE_RULES[current] ?? []);

    return STATUS_OPTIONS.filter((item) => allowedKeys.has(item.key));
  }, [status]);

  const selectValue = React.useMemo(
    () => (options.some((opt) => opt.key === value) ? value : EMPTY_STATUS_VALUE),
    [options, value],
  );

  const handleChange = (val: string) => {
    setValue(val);

    // open dialogs for specific choices
    if (val === "return") {
      setOpenReturn(true);
    } else if (val === "canceled") {
      setOpenCancel(true);
    } else if (val === "paid") {
      setOpenPaid(true);
    } else if (val === "exchange") {
      setOpenExchange(true);
    } else if (val === "canceled_no_stock") {
      setOpenCancelNoStock(true);
    } else if (val === "canceled_wrong_price") {
      setOpenCancelWrongPrice(true);
    } else if (val === "return_issue") {
      setOpenIssueRefund(true);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
      <div className="flex items-center gap-2 flex-1">
        <div className="text-slate-500 font-medium">Status:</div>
        <span className="font-semibold text-slate-900">{getStatusLabel(status)}</span>
      </div>

      <div className="flex items-center gap-2">
        <Select value={selectValue} onValueChange={handleChange}>
          <SelectTrigger
            className="w-fit h-7 min-h-7 px-2 rounded-md border border-slate-200 bg-white"
            iconColor="#334155"
          >
            {/* <SelectValue placeholder={labelFor(value) || "Select"} /> */}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={EMPTY_STATUS_VALUE} className="hidden" disabled>
              Select
            </SelectItem>
            {options.map((opt, index) => (
              <SelectItem
                key={opt.key}
                value={opt.key}
                className="cursor-pointer"
              >
                {index + 1}. {getOrderStatusActionLabel(opt.key, opt.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dialogs */}
      {openReturn && (
        <ReturnConfirmDialog
          id={order.id}
          status={status}
          // close handler to hide dialog after finished/cancelled
          open={openReturn}
          onClose={() => {
            setOpenReturn(false);
            setValue(EMPTY_STATUS_VALUE);
          }}
        />
      )}

      {openCancel && (
        <CancelConfirmDialog
          id={order.id}
          status={status}
          open={openCancel}
          onClose={() => {
            setOpenCancel(false);
            setValue(EMPTY_STATUS_VALUE);
          }}
        />
      )}

      {openIssueRefund && (
        <IssueRefundDialog
          id={order.id}
          order={order}
          open={openIssueRefund}
          onClose={() => {
            setOpenIssueRefund(false);
            setValue(EMPTY_STATUS_VALUE);
          }}
        />
      )}

      {openCancelNoStock && (
        <CancelNoStockConfirmDialog
          id={order.id}
          status={status}
          open={openCancelNoStock}
          onClose={() => {
            setOpenCancelNoStock(false);
            setValue(EMPTY_STATUS_VALUE);
          }}
        />
      )}

      {openCancelWrongPrice && (
        <CancelWrongPriceDialog
          id={order.id}
          status={status}
          open={openCancelWrongPrice}
          onClose={() => {
            setOpenCancelWrongPrice(false);
            setValue(EMPTY_STATUS_VALUE);
          }}
        />
      )}

      {openPaid && (
        <PaidConfirmDialog
          id={order.id}
          status={status}
          open={openPaid}
          onClose={() => {
            setOpenPaid(false);
            setValue(EMPTY_STATUS_VALUE);
          }}
        />
      )}

      {openExchange && (
        <ExchangeConfirmDialog
          id={order.id}
          status={status}
          open={openExchange}
          onClose={() => {
            setOpenExchange(false);
            setValue(EMPTY_STATUS_VALUE);
          }}
        />
      )}
    </div>
  );
}
