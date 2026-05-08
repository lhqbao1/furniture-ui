"use client";

import { useGetProductLogs } from "@/features/products/hook";
import { formatDateTimeString } from "@/lib/date-formated";
import { ProductDetailLog } from "@/types/products";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface DetailsLogTabProps {
  productId?: string;
}

const MAX_ACTIVITY_VALUE_LENGTH = 180;

const normalizeValue = (value: string | null | undefined): string => {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
};

const toCompactSingleLine = (value: string): string => {
  if (value === "—") return value;
  return value.replace(/\s+/g, " ").trim();
};

const truncateLogValue = (value: string, max = MAX_ACTIVITY_VALUE_LENGTH) => {
  if (value === "—") return value;
  if (value.length <= max) return value;
  return `${value.slice(0, max)}...`;
};

const shouldTruncateLogValue = (
  value: string,
  max = MAX_ACTIVITY_VALUE_LENGTH,
) => value !== "—" && value.length > max;

const getChangedValue = (item: ProductDetailLog): string => {
  return toCompactSingleLine(normalizeValue(item.new_value));
};

const getOldValue = (item: ProductDetailLog): string => {
  return toCompactSingleLine(normalizeValue(item.old_value));
};

const DetailsLogTab = ({ productId }: DetailsLogTabProps) => {
  const [showAllValues, setShowAllValues] = useState(false);
  const {
    data: logs = [],
    isLoading,
    isError,
  } = useGetProductLogs(productId ?? "");

  if (!productId) {
    return <div className="py-2 text-sm text-gray-500">No product id.</div>;
  }

  if (isLoading) {
    return <div className="py-2 text-sm text-gray-500">Loading logs...</div>;
  }

  if (isError) {
    return (
      <div className="py-2 text-sm text-red-500">
        Failed to load product logs.
      </div>
    );
  }

  if (!logs.length) {
    return <div className="py-2 text-sm text-gray-500">No logs found.</div>;
  }

  const hasLongValues = logs.some((item) => {
    const changedValue = getChangedValue(item);
    const oldValue = getOldValue(item);
    return (
      shouldTruncateLogValue(changedValue) || shouldTruncateLogValue(oldValue)
    );
  });

  return (
    <div className="overflow-x-auto select-text">
      <div className="w-full min-w-[1000px]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="text-lg font-semibold">Total: {logs.length}</div>
          {hasLongValues ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowAllValues((prev) => !prev)}
            >
              {showAllValues ? "Collapse values" : "Show all values"}
            </Button>
          ) : null}
        </div>

        <div className="grid grid-cols-[minmax(140px,180px)_minmax(220px,300px)_minmax(260px,1fr)_minmax(260px,1fr)_minmax(150px,190px)] gap-x-6 gap-y-2">
          <div className="font-semibold uppercase">Field:</div>
          <div className="font-semibold uppercase">User Email:</div>
          <div className="font-semibold uppercase">Changed Value:</div>
          <div className="font-semibold uppercase">Old Value:</div>
          <div className="font-semibold uppercase">Updated At:</div>
          <div className="col-span-5 mb-1.5 border-b-2 border-gray-400" />

          {logs.map((item) => {
            const changedValue = getChangedValue(item);
            const oldValue = getOldValue(item);

            return (
              <React.Fragment key={item.id}>
                <div className="text-sm break-words whitespace-normal select-text">
                  {item.field || "—"}
                </div>
                <div className="text-sm break-all whitespace-normal select-text">
                  {item.user?.email || "—"}
                </div>
                <div
                  className="text-sm break-all whitespace-normal leading-5 select-text"
                  title={changedValue}
                >
                  {showAllValues
                    ? changedValue
                    : truncateLogValue(changedValue)}
                </div>
                <div
                  className="text-sm break-all whitespace-normal leading-5 select-text"
                  title={oldValue}
                >
                  {showAllValues ? oldValue : truncateLogValue(oldValue)}
                </div>
                <div className="text-sm whitespace-nowrap select-text">
                  {formatDateTimeString(item.updated_at)}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DetailsLogTab;
