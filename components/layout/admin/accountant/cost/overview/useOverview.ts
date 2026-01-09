"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getCheckOutDashboard,
  getProductsCheckOutDashboard,
} from "@/features/checkout/api";
import { getFixedFeeWithTime } from "@/features/fixed-fee/api";
import { getMonthRange, formatLocal } from "@/hooks/get-month-range-by-month";
import { getVariableFeeByMarketplaceAndTime } from "@/features/variable-cost/api";

const getLast6Months = () => {
  const now = new Date();
  return Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      month: d.getMonth() + 1,
      year: d.getFullYear(),
    };
  });
};

export function useDashboard6Months() {
  const months = getLast6Months();

  return useQuery({
    queryKey: ["dashboard-6m"],
    queryFn: async () => {
      const batch = await Promise.all(
        months.map(async ({ month, year }) => {
          const { start, end } = getMonthRange(year, month);
          const from_date = formatLocal(start);
          const to_date = formatLocal(end);

          const [checkout, products, fixed, variable] = await Promise.all([
            getCheckOutDashboard({ from_date, to_date }),
            getProductsCheckOutDashboard({ from_date, to_date }),
            getFixedFeeWithTime({ month, year }),
            getVariableFeeByMarketplaceAndTime({ month, year }),
          ]);

          const revenue = checkout?.grand_total_amount || 0;
          const productCost = products?.summary.total_cost || 0;
          const fixedCost = fixed?.total_fee || 0;
          const variableCost =
            typeof variable?.total === "number" ? variable.total : 0;

          return {
            month,
            year,
            revenue,
            productCost,
            fixedCost,
            variableCost,
            totalCost: productCost + fixedCost + variableCost,
            profit: revenue - (productCost + fixedCost + variableCost),
            margin:
              revenue > 0
                ? ((revenue - (productCost + fixedCost + variableCost)) /
                    revenue) *
                  100
                : 0,
          };
        }),
      );

      return batch;
    },
  });
}
