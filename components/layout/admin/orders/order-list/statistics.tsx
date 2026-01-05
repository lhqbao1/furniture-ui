import { cn } from "@/lib/utils";
import { Statistic } from "@/types/statistics";
import React from "react";

interface OrderStatisticProps {
  statistic?: Statistic[];
  isOrder?: boolean;
  isDashBoard?: boolean;
}

const OrderStatistic = ({
  statistic,
  isOrder,
  isDashBoard,
}: OrderStatisticProps) => {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4",
        isDashBoard ? " lg:grid-cols-3" : "lg:grid-cols-4",
      )}
    >
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
    </div>
  );
};

export default OrderStatistic;
