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
import { STATUS_OPTIONS } from "@/data/data";
import PaidConfirmDialog from "./dialog/paid-comfirm-dialog";

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

      if (current === "pending") {
        return {
          ...item,
          active: item.key === "paid",
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
      return { ...item, active: false };
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
    } else if (val === "paid") {
      setOpenPaid(true);
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

      {openPaid && (
        <PaidConfirmDialog
          id={order.id}
          status={status}
          open={openCancel}
          onClose={() => {
            setOpenPaid(false);
            setValue(status.toLocaleLowerCase());
          }}
        />
      )}
    </div>
  );
}
