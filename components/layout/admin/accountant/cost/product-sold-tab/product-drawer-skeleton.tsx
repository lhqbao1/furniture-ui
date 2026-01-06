import { Skeleton } from "@/components/ui/skeleton";

export default function ProviderDrawerSkeleton() {
  return (
    <div className="space-y-4">
      {/* Image skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-[200px] w-[200px] rounded-md" />
      </div>

      {/* Provider ID */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-40" />
      </div>

      {/* EAN */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-48" />
      </div>

      {/* Product name */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-full" />
      </div>
    </div>
  );
}
