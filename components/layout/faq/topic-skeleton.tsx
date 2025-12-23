import { Skeleton } from "@/components/ui/skeleton";

export function FAQTopicSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col items-center justify-center gap-1.5 py-4"
        >
          {/* Icon */}
          <Skeleton className="h-8 w-8 rounded-full" />

          {/* Text */}
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
