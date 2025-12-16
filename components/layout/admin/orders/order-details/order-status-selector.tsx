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

export default function OrderStatusSelector({
  status,
  order,
}: {
  status: string;
  order: CheckOutMain; // or CheckOutMain
}) {
  const [value, setValue] = React.useState<string>(status?.toLowerCase() ?? "");
  const [openReturn, setOpenReturn] = React.useState(false);
  const [openCancel, setOpenCancel] = React.useState(false);
  const [openPaid, setOpenPaid] = React.useState(false);
  const [openExchange, setOpenExchange] = React.useState(false);
  const [openCancelNoStock, setOpenCancelNoStock] = React.useState(false);

  const options = React.useMemo(() => {
    const current = String(status).toLowerCase();
    const allowedKeys = STATUS_ACTIVE_RULES[current] ?? [];

    return STATUS_OPTIONS.map((item) => {
      // nếu item đại diện cho nhiều status (dispatched)
      const isCurrent =
        item.statuses?.includes(current) || item.key === current;

      return {
        ...item,
        active: allowedKeys.includes(item.key),
        current: isCurrent, // optional: để highlight step hiện tại
      };
    });
  }, [status]);

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
    }
  };

  // helper to display label for current value
  const labelFor = (k: string) => {
    const found = STATUS_OPTIONS.find((s) => s.key === k);
    return found ? found.label : k;
  };

  return (
    <div className="flex items-center justify-between text-sm py-1 px-2 border rounded-md font-bold">
      <div className="flex gap-1 items-center flex-1">
        <div>Status:</div>
        <div>
          {labelFor(
            STATUS_OPTIONS.find((i) => i.key === status.toLowerCase())?.label ??
              "",
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={value}
          onValueChange={handleChange}
        >
          <SelectTrigger
            className="w-fit px-0 py-0 border-none"
            iconColor="black"
          >
            {/* <SelectValue placeholder={labelFor(value) || "Select"} /> */}
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem
                key={opt.key}
                value={opt.key}
                disabled={!opt.active} // ⬅️ disable option không hợp lệ
              >
                {opt.key === "completed" ? "" : `${opt.pos - 1}.`} {opt.label}
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
            setValue(status.toLocaleLowerCase());
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
            setValue(status.toLocaleLowerCase());
          }}
        />
      )}

      {openCancelNoStock && (
        <CancelConfirmDialog
          id={order.id}
          status={status}
          open={openCancelNoStock}
          onClose={() => {
            setOpenCancelNoStock(false);
            setValue(status.toLocaleLowerCase());
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
            setValue(status.toLocaleLowerCase());
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
            setValue(status.toLocaleLowerCase());
          }}
        />
      )}
    </div>
  );
}
