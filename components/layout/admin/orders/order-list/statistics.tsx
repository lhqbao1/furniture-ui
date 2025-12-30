import { SingleDatePicker } from "@/components/shared/single-date-picker";
import { Statistic } from "@/types/statistics";
import React from "react";

function formatDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
}

interface ProductStatisticProps {
  statistic?: Statistic[];
  isOrder?: boolean;
  fromDate?: string;
  setFromDate?: React.Dispatch<React.SetStateAction<string | undefined>>;
  endDate?: string;
  setEndDate?: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const OrderStatistics = ({
  statistic,
  isOrder,
  fromDate,
  setFromDate,
  endDate,
  setEndDate,
}: ProductStatisticProps) => {
  return (
    <div className="grid lg:grid-cols-4 grid-cols-2 gap-4">
      {(statistic ?? []).map((item, idx) => (
        <div
          key={idx}
          className="rounded-sm py-4 flex flex-col justify-center items-center gap-2 border"
          style={{ backgroundColor: item.color, opacity: 30 }}
        >
          <div
            className="uppercase font-semibold text-center text-2xl"
            style={{ color: item.textColor }}
          >
            {item.label}
          </div>

          {isOrder && <div className="text-xl">{item.count}</div>}

          <div className="text-3xl font-light text-[#4D4D4D]">
            €{item.total.toLocaleString()}
          </div>
        </div>
      ))}

      {/* Date pickers */}
      {/* <div className="grid lg:grid-cols-2 grid-cols-1 gap-2 mt-2">
        <div className="flex gap-2 items-center justify-start">
          <div className="">From:</div>
          <SingleDatePicker
            label=""
            value={fromDate}
            onChange={(v) => {
              if (!v) return setFromDate?.(undefined);
              const d = new Date(v);
              d.setHours(0, 0, 0, 0);
              setFromDate?.(formatDate(d));
            }}
          />
        </div>

        <div className="flex gap-2 items-center justify-start">
          <div>To:</div>
          <SingleDatePicker
            label=""
            value={endDate}
            onChange={(v) => {
              if (!v) return setEndDate?.(undefined);
              const d = new Date(v);
              d.setHours(23, 59, 59, 0);
              setEndDate?.(formatDate(d));
            }}
          />
        </div>
      </div> */}
    </div>
  );
};

export default OrderStatistics;
