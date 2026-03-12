// components/product-grid-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ProductGridSkeletonProps {
  length?: number;
  hasLoading?: boolean;
}

export function ProductGridSkeleton({
  length = 4,
  hasLoading = false,
}: ProductGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 sm:mt-6 mt-4 gap-8">
      {Array.from({ length }).map((_, idx) => (
        <Card
          key={idx}
          className="relative overflow-hidden border-0 rounded-none shadow-none bg-transparent"
        >
          <CardContent className="bg-white p-0">
            {/* 🔹 Loader overlay */}
            {hasLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            <Skeleton className="mb-2 h-96 w-full rounded-md" />

            <div className="product-details py-2 mt-0 md:mt-4 xl:mt-4 flex flex-col gap-2 w-full">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />

              <div className="flex gap-2">
                <Skeleton className="h-5 w-14" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
