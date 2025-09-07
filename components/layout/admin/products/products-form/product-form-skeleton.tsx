"use client"

import { Skeleton } from "@/components/ui/skeleton"

const ProductFormSkeleton = () => {
    return (
        <div className="pb-20">
            <div className="grid-cols-12 grid gap-5 w-full">
                {/* Left side */}
                <div className="col-span-8 flex flex-col gap-4">
                    <Skeleton className="h-6 w-40" /> {/* Title */}

                    <Skeleton className="h-10 w-full" /> {/* Product type selector */}
                    <Skeleton className="h-10 w-full" /> {/* Product name */}
                    <Skeleton className="h-20 w-full" /> {/* Pricing fields */}
                    <Skeleton className="h-28 w-full" /> {/* Tax radio group */}
                    <Skeleton className="h-40 w-full" /> {/* Description (editor) */}
                    <Skeleton className="h-32 w-full" /> {/* Image picker */}
                    <Skeleton className="h-40 w-full" /> {/* Variants */}
                </div>

                {/* Right side */}
                <div className="col-span-4 flex flex-col items-end gap-4">
                    {/* Buttons */}
                    <div className="flex gap-2 justify-end w-full">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </div>

                    {/* Active toggle */}
                    <div className="flex items-center gap-2 w-full">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-6 w-12" />
                    </div>

                    {/* ID */}
                    <Skeleton className="h-5 w-32" />

                    {/* Category */}
                    <Skeleton className="h-10 w-full" />

                    {/* Stock */}
                    <Skeleton className="h-10 w-28" />

                    {/* SKU */}
                    <Skeleton className="h-10 w-full" />

                    {/* Barcode */}
                    <Skeleton className="h-10 w-full" />

                    {/* Weight */}
                    <Skeleton className="h-10 w-32" />

                    {/* Packaging */}
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-14" />
                        <Skeleton className="h-10 w-14" />
                        <Skeleton className="h-10 w-14" />
                    </div>

                    {/* Tags */}
                    <div className="flex gap-2 flex-wrap">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-6 w-14 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductFormSkeleton
