import { Skeleton } from "@/components/ui/skeleton";

export function FAQTopicSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex min-h-16 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
        >
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-4 w-full max-w-24" />
        </div>
      ))}
    </>
  );
}
