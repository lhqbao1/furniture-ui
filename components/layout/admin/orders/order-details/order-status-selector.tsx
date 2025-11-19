import React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ReturnConfirmDialog from "../order-list/return-confirm-dialog";
import CancelConfirmDialog from "../order-list/canceled-confirm-dialog";
import { CheckOutMain } from "@/types/checkout";

const STATUS_OPTIONS = [
  { key: "pending", label: "Waiting for payment", active: true, pos: 2 },
  { key: "paid", label: "Payment received", active: true, pos: 3 },
  { key: "stock_reserved", label: "Stock reserved", active: true, pos: 4 },
  {
    key: "preparation_shipping",
    label: "In preparation for shipping",
    active: true,
    pos: 5,
  },
  { key: "ds_informed", label: "DS informed", active: true, pos: 6 },
  { key: "shipped", label: "Dispatched", active: true, pos: 7 },
  { key: "completed", label: "Completed", active: true, pos: 0 },
  { key: "cancel_request", label: "Cancel requested", active: true, pos: 8 },
  { key: "canceled", label: "Canceled", active: true, pos: 9 },
  { key: "return", label: "Return", active: true, pos: 10 },
];

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

  // compute items to show in dropdown:
  // if current status is completed -> only show "return" option
  const options = React.useMemo(() => {
    const current = String(status).toLowerCase();

    return STATUS_OPTIONS.map((item) => {
      // Khi status là completed → chỉ return được phép active
      if (current === "completed") {
        return {
          ...item,
          active: item.key === "return",
        };
      }

      // Khi status là paid → chỉ canceled active
      if (current === "paid") {
        return {
          ...item,
          active: item.key === "canceled",
        };
      }

      // Các trạng thái khác → tất cả active
      return { ...item, active: true };
    });
  }, [status]);

  const handleChange = (val: string) => {
    setValue(val);

    // open dialogs for specific choices
    if (val === "return") {
      setOpenReturn(true);
    } else if (val === "canceled") {
      // keep previous behavior: choosing "paid" can open CancelConfirmDialog
      setOpenCancel(true);
    } else {
      // other statuses: no dialog, you can trigger an API call here if needed
      // e.g. updateStatusAPI(order.id, val)
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
                {opt.key === "completed" ? "" : `${opt.pos}.`} {opt.label}
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
    </div>
  );
}
