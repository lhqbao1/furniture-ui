"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function OrderListSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-2 sm:px-0">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-secondary/20 bg-white shadow-sm"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
            <Skeleton className="h-5 w-32" /> {/* Order ID */}
            <Skeleton className="h-5 w-32" /> {/* Date + delivery range */}
          </div>

          {/* Table rows placeholder */}
          <div className="space-y-3 px-4 py-4">
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
          <div className="space-y-3 border-t bg-secondary/5 px-4 py-3">
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
