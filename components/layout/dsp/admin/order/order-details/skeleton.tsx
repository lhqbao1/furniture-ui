"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function SupplierOrderDetailsSkeleton() {
  return (
    <div className="space-y-12 pb-20 animate-pulse">
      {/* Back button */}
      <Skeleton className="h-10 w-32" />

      {/* Overview + User */}
      <div className="grid lg:grid-cols-4 grid-cols-2 lg:gap-12 gap-4">
        <Skeleton className="col-span-2 h-40 w-full" />
        <Skeleton className="col-span-2 h-40 w-full" />
      </div>

      {/* Product table */}
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" /> {/* header */}
        {[...Array(5)].map((_, i) => (
          <Skeleton
            key={i}
            className="h-14 w-full"
          /> // rows
        ))}
      </div>

      {/* Summary + documents */}
      <div className="flex justify-between w-full mt-6">
        <div className="flex gap-12">
          <Skeleton className="h-40 w-60" />
          <Skeleton className="h-40 w-60" />
        </div>

        <Skeleton className="h-48 w-72" />
      </div>
    </div>
  );
}
