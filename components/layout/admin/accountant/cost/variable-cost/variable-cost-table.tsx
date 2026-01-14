import React, { useEffect, useMemo } from "react";
import { useVariableCost } from "./useVariableCost";
import { GetVariableFeeByMarketplaceResponse } from "@/types/variable-fee";
import { useAtom } from "jotai";
import { variableCostAtom } from "@/store/variable";

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

      if (!feeData || typeof feeData !== "object") return null;

      const feePercent = (item.total_amount * feeData.total) / 100;

      const fee = feeData.total;

      return {
        marketplace: item.marketplace,
        orders: item.total_orders,
        grossRevenue: item.total_amount,
        fee,
        feePercent,
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
  const [variableCost, setVariableCost] = useAtom(variableCostAtom);
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

  const totalFeePercent = useMemo(
    () => tableRows.reduce((sum, i) => sum + i.feePercent, 0),
    [tableRows],
  );

  useEffect(() => {
    setVariableCost(totalFeePercent);
  }, [totalFeePercent, setVariableCost]);

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
          <th className="text-right px-4 py-2">Fee %</th>
          <th className="text-right px-4 py-2">Fee €</th>
        </tr>
      </thead>

      <tbody>
        {tableRows.map((row) => (
          <tr
            key={row.marketplace}
            className="border-t"
          >
            <td className="px-4 py-2 capitalize">
              {row.marketplace.replace("_", " ") ?? ""}
            </td>

            <td className="px-4 py-2 text-right">{row.orders}</td>

            <td className="px-4 py-2 text-right">
              {row.grossRevenue.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>

            <td className="px-4 py-2 text-right text-destructive">
              {row.fee.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              %
            </td>

            <td className="px-4 py-2 text-right">
              {row.feePercent.toFixed(2)}€
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default VariableCostTable;
