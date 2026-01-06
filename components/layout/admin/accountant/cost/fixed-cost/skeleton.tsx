import { Skeleton } from "@/components/ui/skeleton";

export function FixedCostRowSkeleton() {
  return (
    <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-3 items-center animate-pulse">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-8 w-8 rounded-md" />
    </div>
  );
}
