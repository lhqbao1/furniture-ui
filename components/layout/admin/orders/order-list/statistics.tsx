import { Statistic } from "@/types/statistics";
import React from "react";

interface OrderStatisticProps {
  statistic?: Statistic[];
  isOrder?: boolean;
}

const OrderStatistic = ({ statistic, isOrder }: OrderStatisticProps) => {
  return (
    <div className="grid lg:grid-cols-3 grid-cols-2 gap-4">
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
