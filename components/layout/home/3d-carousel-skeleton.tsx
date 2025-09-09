"use client"

import { Skeleton } from "@/components/ui/skeleton"

const AnimatedCarouselSkeleton = () => {
    return (
        <div className="relative w-full xl:h-[600px] h-[300px] xl:min-h-[500px] flex items-center justify-center gap-6">
            {/* Fake cards */}
            {Array.from({ length: 5 }).map((_, idx) => (
                <div
                    key={idx}
                    className="flex flex-col items-center"
                >
                    <Skeleton className="w-[180px] h-[220px] md:w-[260px] md:h-[320px] xl:w-[295px] xl:h-[360px] rounded-xl" />
                    <div className="mt-4 flex flex-col items-center gap-3">
                        <Skeleton className="h-6 w-24 rounded" />
                        <Skeleton className="h-10 w-32 rounded" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default AnimatedCarouselSkeleton
