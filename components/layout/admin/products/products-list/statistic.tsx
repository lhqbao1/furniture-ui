"use client";
import { Calendar } from "@/components/ui/calendar";
import { Statistic } from "@/types/statistics";
import React from "react";
import { DateRange } from "react-day-picker";

interface StatisticsProps {
  statistic?: Statistic[];
  isOrder?: boolean;
  fromDate?: string;
  setFromDate?: React.Dispatch<React.SetStateAction<string | undefined>>;
  endDate?: string;
  setEndDate?: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const ProductStatistic = ({
  statistic,
  isOrder,
  fromDate,
  setFromDate,
  endDate,
  setEndDate,
}: StatisticsProps) => {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(2025, 5, 12),
    to: new Date(2025, 6, 15),
  });

  return (
    <div className="grid lg:grid-cols-4 grid-cols-2 gap-4">
      {(statistic ?? []).map((item, index) => {
        return (
          <div
            key={index}
            className={`rounded-sm py-4 flex flex-col justify-center items-center gap-2 border`}
            style={{
              backgroundColor: item.color ? item.color : "white",
              opacity: 30,
            }}
          >
            <div
              className={`uppercase font-semibold text-center text-2xl`}
              style={{
                color: item.textColor,
              }}
            >
              {item.label}
            </div>
            {isOrder && <div className="text-xl">{item.count}</div>}
            <div className={`text-3xl font-light text-[#4D4D4D]`}>
              €{item.total.toLocaleString()}
            </div>
          </div>
        );
      })}

      <div>
        <Calendar
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={setDateRange}
          numberOfMonths={2}
          className="rounded-lg border shadow-sm"
        />
      </div>
    </div>
  );
};

export default ProductStatistic;
