import { Skeleton } from "@/components/ui/skeleton"

export function SectionSkeleton() {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between bg-secondary/10 p-2">
                <Skeleton className="h-5 w-32" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Address Line */}
                <div className="col-span-2 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>

                {/* Address Additional */}
                <div className="col-span-2 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>

                {/* Postal Code */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>

                {/* City (popover trigger) */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
            </div>
        </div>
    )
}
