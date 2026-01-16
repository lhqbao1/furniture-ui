import { Skeleton } from "@/components/ui/skeleton";

const FBTSectionSkeleton = () => {
  return (
    <div className="xl:my-16 lg:my-12 md:my-10 my-6 space-y-6">
      <Skeleton className="h-7 w-72" />

      <div className="flex xl:flex-row flex-col items-center justify-start gap-0 space-y-6 xl:space-y-0">
        {/* Product 1 */}
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-[300px] h-[200px] rounded-md" />
          <div className="flex flex-col justify-center items-center gap-2">
            <Skeleton className="h-4 w-40" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-sm" /> {/* checkbox */}
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </div>

        <Skeleton className="w-16 h-16 mx-4 opacity-40 hidden xl:block" />

        {/* Product 2 */}
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-[300px] h-[200px] rounded-md" />
          <div className="flex flex-col justify-center items-center gap-2 relative w-full">
            <Skeleton className="h-4 w-40" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-sm" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </div>

        <Skeleton className="w-16 h-16 mx-4 opacity-40 hidden xl:block" />

        {/* Product 3 */}
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-[300px] h-[200px] rounded-md" />
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-4 w-40" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-sm" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </div>

        <Skeleton className="w-16 h-16 mx-4 opacity-40 hidden xl:block" />

        {/* Summary Block */}
        <div className="flex flex-col gap-3 flex-1 items-start">
          <div className="flex gap-2 items-center">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-12 w-48 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default FBTSectionSkeleton;
