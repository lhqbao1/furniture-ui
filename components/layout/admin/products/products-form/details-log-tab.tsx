"use client";

import { useGetProductLogs } from "@/features/products/hook";
import { formatDateTimeString } from "@/lib/date-formated";
import { ProductDetailLog } from "@/types/products";
import React from "react";

interface DetailsLogTabProps {
  productId?: string;
}

const normalizeValue = (value: string | null | undefined): string => {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
};

const getChangedValue = (item: ProductDetailLog): string => {
  return normalizeValue(item.new_value);
};

const getOldValue = (item: ProductDetailLog): string => {
  return normalizeValue(item.old_value);
};

const DetailsLogTab = ({ productId }: DetailsLogTabProps) => {
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

  return (
    <div className="overflow-x-auto">
      <div className="w-max min-w-full">
        <div className="mb-4 text-lg font-semibold">Total: {logs.length}</div>

        <div className="grid grid-cols-[minmax(180px,220px)_minmax(260px,320px)_minmax(360px,1fr)_minmax(360px,1fr)_minmax(180px,220px)] gap-x-6 gap-y-2">
          <div className="font-semibold uppercase">Field:</div>
          <div className="font-semibold uppercase">User Email:</div>
          <div className="font-semibold uppercase">Changed Value:</div>
          <div className="font-semibold uppercase">Old Value:</div>
          <div className="font-semibold uppercase">Updated At:</div>
          <div className="col-span-5 mb-1.5 border-b-2 border-gray-400" />

          {logs.map((item) => (
            <React.Fragment key={item.id}>
              <div className="text-sm break-words">{item.field || "—"}</div>
              <div className="text-sm break-words">{item.user?.email || "—"}</div>
              <div className="break-words whitespace-normal text-sm">
                {getChangedValue(item)}
              </div>
              <div className="break-words whitespace-normal text-sm">
                {getOldValue(item)}
              </div>
              <div className="text-sm whitespace-nowrap">
                {formatDateTimeString(item.updated_at)}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetailsLogTab;
