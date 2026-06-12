"use client";

import { useGetCheckoutLogsByMainCheckoutId } from "@/features/checkout/hook";
import { formatDateTimeString } from "@/lib/date-formated";

interface OrderCheckoutLogProps {
  mainCheckoutId: string;
}

const formatLogValue = (value: string | null) => {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : "-";
};

const getUserDisplayName = (
  user?: {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  } | null,
) => {
  const fullName = [user?.first_name, user?.last_name]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ");

  return fullName || user?.email || "-";
};

const OrderCheckoutLog = ({ mainCheckoutId }: OrderCheckoutLogProps) => {
  const {
    data: logs = [],
    isLoading,
    isError,
  } = useGetCheckoutLogsByMainCheckoutId(mainCheckoutId);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Order logs</h3>
          <p className="text-sm text-muted-foreground">
            History of changes made to this order.
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          {isLoading ? "Loading..." : `${logs.length} logs`}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2 rounded-xl border border-slate-100 p-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`checkout-log-skeleton-${index}`}
              className="h-11 animate-pulse rounded-lg bg-slate-100"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          Unable to load order logs.
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-sm text-muted-foreground">
          No logs found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-secondary/10 text-left text-xs uppercase text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                  <th className="px-4 py-3 font-semibold">Old value</th>
                  <th className="px-4 py-3 font-semibold">New value</th>
                  <th className="px-4 py-3 font-semibold">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {logs.map((log) => (
                  <tr key={log.id} className="align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {formatDateTimeString(log.created_at) || "-"}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {formatLogValue(log.action)}
                    </td>
                    <td className="max-w-xs whitespace-pre-wrap break-words px-4 py-3 text-slate-600">
                      {formatLogValue(log.old_value)}
                    </td>
                    <td className="max-w-xs whitespace-pre-wrap break-words px-4 py-3 text-slate-900">
                      {formatLogValue(log.new_value)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {getUserDisplayName(log.user)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {log.user?.email ?? ""}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};

export default OrderCheckoutLog;
