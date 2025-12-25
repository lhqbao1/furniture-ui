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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-4 sm:mt-6 mt-4">
      {Array.from({ length }).map((_, idx) => (
        <Card
          key={idx}
          className="relative overflow-hidden border-0 rounded-none shadow-none"
        >
          <CardContent className="bg-white p-0 py-4 flex flex-col items-center justify-center min-h-[260px]">
            {/* 🔹 Loader overlay */}
            {hasLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Skeleton content */}
            <Skeleton className="w-full h-48 mb-2 rounded" />

            <div className="product-details py-2 mt-0 md:mt-5 xl:mt-8 flex flex-col gap-2 w-full">
              {/* Product name */}
              <Skeleton className="h-6 w-3/4 mx-auto" />

              {/* Price */}
              <div className="flex justify-center gap-2">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
