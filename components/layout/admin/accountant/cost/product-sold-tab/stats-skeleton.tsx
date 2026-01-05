"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="flex items-center gap-4 p-6">
            {/* Icon skeleton */}
            <Skeleton className="h-12 w-12 rounded-full" />

            {/* Text skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-7 w-16" />

              {/* Optional sub text (for revenue card) */}
              {index === 2 && <Skeleton className="h-4 w-24" />}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
