"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function AccountSkeleton() {
    return (
        <div className="grid grid-cols-12 gap-4 lg:gap-12 py-2 lg:py-6">
            {/* Left column: span 12 on mobile, 4 on lg */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-40 w-full rounded-xl" />
                <div className="space-y-3">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-3/5" />
                </div>
                <Skeleton className="h-12 w-full rounded-lg" />
            </div>

            {/* Right column: span 12 on mobile, 8 on lg */}
            <div className="col-span-12 lg:col-span-8 space-y-4">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-64 w-full rounded-xl" />
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-11/12" />
                    <Skeleton className="h-4 w-10/12" />
                    <Skeleton className="h-4 w-9/12" />
                </div>
            </div>
        </div>
    )
}
