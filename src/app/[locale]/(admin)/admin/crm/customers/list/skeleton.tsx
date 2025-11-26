import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const CustomerListSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Back button skeleton */}
      <Skeleton className="h-10 w-32 rounded-md" />

      <div className="space-y-6">
        {/* Page title */}
        <div className="flex justify-center">
          <Skeleton className="h-10 w-64" />
        </div>

        {/* Table Header */}
        <div className="w-full border rounded-lg">
          <div className="grid grid-cols-6 gap-4 p-4 bg-muted">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>

          {/* Rows */}
          <div className="divide-y">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-6 gap-4 p-4 items-center"
              >
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-end gap-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-16" />
        </div>
      </div>
    </div>
  );
};

export default CustomerListSkeleton;
