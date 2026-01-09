"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfitRevenueBarChartSkeleton() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-5 w-40" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-24 mt-1" />
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="w-full h-[300px] relative">
          <Skeleton className="absolute bottom-0 w-full h-[2px]" />{" "}
          {/* x-axis */}
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className="absolute bottom-0 w-[40px] h-[50%] rounded"
              style={{ left: `${i * 60 + 20}px` }}
            />
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-3 w-40" />
      </CardFooter>
    </Card>
  );
}
