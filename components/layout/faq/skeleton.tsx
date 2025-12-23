import { Skeleton } from "@/components/ui/skeleton";

export function FAQQuestionSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="w-full space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="border rounded-sm px-2 py-3"
        >
          {/* Question */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>

          {/* Answer (collapsed look) */}
          <div className="mt-4 flex gap-4">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="flex flex-col gap-2 w-full">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
