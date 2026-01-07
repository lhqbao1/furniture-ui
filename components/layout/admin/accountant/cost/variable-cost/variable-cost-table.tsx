import React, { useMemo } from "react";
import { useVariableCost } from "./useVariableCost";
import { GetVariableFeeByMarketplaceResponse } from "@/types/variable-fee";

export interface MarketplaceCostRow {
  marketplace: string;
  orders: number;
  grossRevenue: number;
  fee: number;
  feePercent: number;
}

const mergeMarketplaceCostData = (
  variableFeeData: GetVariableFeeByMarketplaceResponse,
  checkoutData: {
    marketplace: string;
    total_orders: number;
    total_amount: number;
    percentage: number;
  }[],
): MarketplaceCostRow[] => {
  if (!variableFeeData || !checkoutData) return [];

  return checkoutData
    .map((item) => {
      const feeData = variableFeeData[item.marketplace];

      // ❌ marketplace không có variable fee
      if (!feeData || typeof feeData !== "object") return null;

      return {
        marketplace: item.marketplace,
        orders: item.total_orders,
        grossRevenue: item.total_amount,
        fee: feeData.total,
        feePercent: item.percentage,
      };
    })
    .filter(Boolean) as MarketplaceCostRow[];
};

interface VariableCostTableProps {
  month: number;
  year: number;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
}

const VariableCostTable = ({
  month,
  year,
  setMonth,
  setYear,
}: VariableCostTableProps) => {
  const { variableFeeData, marketplaceData } = useVariableCost({
    month,
    year,
    setMonth,
    setYear,
  });
  const tableRows = useMemo(() => {
    if (!variableFeeData || !marketplaceData) return [];

    return mergeMarketplaceCostData(
      variableFeeData,
      marketplaceData.data ?? [],
    );
  }, [variableFeeData, marketplaceData]);

  if (!variableFeeData || !marketplaceData) {
    return <>Loading...</>; // hoặc skeleton
  }
  return (
    <table className="w-full border border-border rounded-lg overflow-hidden">
      <thead className="bg-muted">
        <tr>
          <th className="text-left px-4 py-2">Marketplace</th>
          <th className="text-right px-4 py-2">Orders</th>
          <th className="text-right px-4 py-2">Gross Revenue</th>
          <th className="text-right px-4 py-2">Fee €</th>
          <th className="text-right px-4 py-2">Fee %</th>
        </tr>
      </thead>

      <tbody>
        {tableRows.map((row) => (
          <tr
            key={row.marketplace}
            className="border-t"
          >
            <td className="px-4 py-2 capitalize">
              {row.marketplace.replace("_", " ")}
            </td>

            <td className="px-4 py-2 text-right">{row.orders}</td>

            <td className="px-4 py-2 text-right">
              {row.grossRevenue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </td>

            <td className="px-4 py-2 text-right text-destructive">
              -{row.fee.toLocaleString("en-US")}
            </td>

            <td className="px-4 py-2 text-right">
              {row.feePercent.toFixed(2)}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default VariableCostTable;
