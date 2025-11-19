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
  { key: "pending", label: "Waiting for payment" },
  { key: "paid", label: "Payment received" },
  { key: "stock_reserved", label: "Stock reserved" },
  { key: "preparation_shipping", label: "In preparation for shipping" },
  { key: "ds_informed", label: "DS informed" },
  { key: "shipped", label: "Dispatched" },
  { key: "completed", label: "Completed" },
  { key: "cancel_request", label: "Cancel requested" },
  { key: "canceled", label: "Canceled" },
  { key: "return", label: "Return" },
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
    if (String(status).toLowerCase() === "completed") {
      return STATUS_OPTIONS.filter((s) => s.key === "return");
    }
    // otherwise show all except 'completed' itself as option (optional)
    return STATUS_OPTIONS;
  }, [status]);

  const handleChange = (val: string) => {
    setValue(val);

    // open dialogs for specific choices
    if (val === "return") {
      setOpenReturn(true);
    } else if (val === "paid") {
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
      <div className="flex gap-1 items-center">
        <div>Status:</div>
        <div>{labelFor(value)}</div>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={value}
          onValueChange={handleChange}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder={labelFor(value) || "Select"} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem
                key={opt.key}
                value={opt.key}
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* fallback icon when no dialog action */}
        <ArrowRight size={16} />
      </div>

      {/* Dialogs */}
      {openReturn && (
        <ReturnConfirmDialog
          id={order.id}
          status={status}
          // close handler to hide dialog after finished/cancelled
          open={openReturn}
          onClose={() => setOpenReturn(false)}
        />
      )}

      {openCancel && (
        <CancelConfirmDialog
          id={order.id}
          status={status}
          open={openCancel}
          onClose={() => setOpenCancel(false)}
        />
      )}
    </div>
  );
}
