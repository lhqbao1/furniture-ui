"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function ListVariantSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Fake title skeletons for 2 variant groups */}
      {[1].map((g) => (
        <div
          key={g}
          className="flex flex-col gap-2"
        >
          <Skeleton className="h-4 w-32 rounded-md" />

          {/* 3 columns × 2 rows */}
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-16 w-full rounded-md"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
