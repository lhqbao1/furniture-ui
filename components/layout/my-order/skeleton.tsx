"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function OrderListSkeleton() {
  return (
    <div className="lg:w-1/2 mx-auto space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="rounded-md border border-gray-300 overflow-hidden"
        >
          {/* Header */}
          <div className="px-3 py-2 border-b bg-muted/40 flex justify-between items-center">
            <Skeleton className="h-5 w-32" /> {/* Order ID */}
            <Skeleton className="h-5 w-24" /> {/* Date */}
          </div>

          {/* Table rows placeholder */}
          <div className="px-3 py-4 space-y-3">
            {Array.from({ length: 3 }).map((_, r) => (
              <div
                key={r}
                className="flex justify-between items-center"
              >
                <div className="flex gap-3 items-center">
                  <Skeleton className="h-10 w-10 rounded-md" /> {/* image */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" /> {/* title */}
                    <Skeleton className="h-4 w-24" /> {/* variant */}
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <Skeleton className="h-4 w-10" /> {/* qty */}
                  <Skeleton className="h-4 w-16" /> {/* price */}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-3 py-3 border-t space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-20" /> {/* Total */}
              <Skeleton className="h-5 w-24" /> {/* Price */}
            </div>

            <div className="flex justify-center gap-2">
              <Skeleton className="h-10 w-28 rounded-md" /> {/* Button */}
              <Skeleton className="h-10 w-28 rounded-md" /> {/* Button */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
